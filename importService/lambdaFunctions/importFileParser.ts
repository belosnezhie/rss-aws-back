import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: 'eu-central-1' });

export const handler = async (event: S3Event): Promise<void> => {
  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const sourceKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

      if (!sourceKey.startsWith('uploaded/')) {
        console.log(`Skipping file not in uploaded folder: ${sourceKey}`);
        continue;
      }

      console.log(`Processing file: ${sourceKey} from bucket: ${bucket}`);

      const { Body } = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: sourceKey,
        })
      );

      if (Body instanceof Readable) {
        await new Promise((resolve, reject) => {
          Body
            .pipe(csv())
            .on('data', (data) => {
              console.log('Parsed CSV row:', JSON.stringify(data));
            })
            .on('error', (error) => {
              console.error('Error parsing CSV:', error);
              reject(error);
            })
            .on('end', () => {
              console.log('Finished processing CSV file');
              resolve(null);
            });
        });

        const fileName = sourceKey.split('/').pop();
        const destinationKey = `parsed/${fileName}`;

        await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucket,
            CopySource: `${bucket}/${sourceKey}`,
            Key: destinationKey,
          })
        );

        console.log(`Copied file to: ${destinationKey}`);

        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: sourceKey,
          })
        );

        console.log(`Deleted file from: ${sourceKey}`);
      }
    }
  } catch (error) {
    console.error('Error processing S3 event:', error);
    throw error;
  }
};
