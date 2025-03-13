import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import csvParser from "csv-parser";
import { Readable } from 'stream';
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const s3Client = new S3Client({ region: 'eu-central-1' });
const queueClient = new SQSClient({});
const sqsUrl = process.env.SQS_URL;

export const handler = async (event: S3Event): Promise<boolean> => {
  await innerHandler(
    event,
    getFileContentInner,
    moveFileInner
  );
  return true;
};

export async function innerHandler(
  event: S3Event,
  getFileContent: (bucket: string, filePath: string) => Promise<string>,
  moveFile: (bucket: string, filePath: string, destinationPath: string) => Promise<boolean>
): Promise<void> {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const filePath = record.s3.object.key;
    let fileContent = "";
    try {
      fileContent = await getFileContent(bucket, filePath);
    } catch {
      console.log("No body received from S3")
      throw new Error('No body received from S3');
    }

    try {
      await parseCsvStream(fileContent);
    } catch {
      throw new Error('Error during CSV parse');
    }

    const destinationPath = filePath.replace('uploaded', 'parsed');
    try {
      await moveFile(bucket, filePath, destinationPath);
    } catch {
      throw new Error('Error during copy file');
    }
  }
}

async function parseCsvStream(fileContent: string): Promise<any[]> {
  const results: string[] = [];

  return new Promise((resolve, reject) => {
    const stream = Readable.from(fileContent);

    stream
      .pipe(csvParser())
      .on('data', async (data) => {
        console.log("Parsed row:", data);
        await sendMessage(data);
        results.push(data);
      })
      .on('error', (error) => reject(error))
      .on('end', () => resolve(results));
  });
}

async function getFileContentInner(bucket: string, filePath: string): Promise<string> {
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: filePath,
    })
  );

  if (!Body) {
    throw new Error('No body received from S3');
  }

  const fileContent = await Body.transformToString();
  console.log('File content:', fileContent);
  return fileContent;
}

async function moveFileInner(bucket: string, filePath: string, destinationPath: string): Promise<boolean> {
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: bucket + "/" + filePath,
      Key: destinationPath,
    })
  );

  console.log(`Copied file to: ${destinationPath}`);

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: filePath,
    })
  );

  console.log(`Deleted file from: ${filePath}`);
  return true;
}

export async function sendMessage(message: string): Promise<boolean> {
  const command = new SendMessageCommand({
    QueueUrl: sqsUrl,
    DelaySeconds: 10,
    MessageBody: JSON.stringify(message),
  });

  console.log("Add to SQS:", JSON.stringify(message));

  const response = await queueClient.send(command);
  console.log(`Response from Queue:` + JSON.stringify(response));
  return true;
}
