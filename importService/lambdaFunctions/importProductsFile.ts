import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'eu-central-1' });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'File name is required' })
      };
    }

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `uploaded/${fileName}`,
      ContentType: 'text/csv'
    });

    const signedUrl: string = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: signedUrl
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
