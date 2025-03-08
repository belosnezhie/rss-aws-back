import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import csvParser from "csv-parser";
import { Readable } from 'stream';

const s3Client = new S3Client({ region: 'eu-central-1' });

async function parseCsvStream(fileContent: string): Promise<any[]> {
  const results: any[] = [];

  return new Promise((resolve, reject) => {
    const stream = Readable.from(fileContent);

    stream
      .pipe(csvParser())
      .on('data', (data) => {
        console.log("Parsed row:", data);
        results.push(data);
      })
      .on('error', (error) => reject(error))
      .on('end', () => resolve(results));
  });
}

export const handler = async (event: S3Event): Promise<void> => {
  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const objectKey = record.s3.object.key;

      console.log(`Processing file: ${objectKey} from bucket: ${bucket}`);

      const { Body } = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: objectKey,
        })
      );

      if (!Body) {
        throw new Error('No body received from S3');
      }

      const fileContent = await Body.transformToString();
      console.log('File content:', fileContent);

      await parseCsvStream(fileContent);

      const fileName = objectKey.split('/').pop();
      const destinationKey = `parsed/${fileName}`;

      await s3Client.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${objectKey}`,
          Key: destinationKey,
        })
      );

      console.log(`Copied file to: ${destinationKey}`);

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: objectKey,
        })
      );

      console.log(`Deleted file from: ${objectKey}`);
    }
  } catch (error) {
    console.error('Error processing S3 event:', error);
    throw error;
  }
};
