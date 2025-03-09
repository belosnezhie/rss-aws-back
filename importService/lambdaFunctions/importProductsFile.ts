import { APIGatewayProxyResult, APIGatewayProxyEvent } from "aws-lambda";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'eu-central-1' });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return await innerHandler(
    event,
    getFileNameInner,
    uploadFileInner
  );
}

export const innerHandler = async (
  event: APIGatewayProxyEvent,
  getFileName: (event: APIGatewayProxyEvent) => string,
  uploadFile: (s3Client: S3Client, fileName: string) => Promise<string>
): Promise<APIGatewayProxyResult> => {
  let fileName = "";
  try {
    fileName = getFileName(event);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'File name is required' })
    };
  }

  let signedUrl = "";
  try {
    signedUrl = await uploadFile(s3Client, fileName);
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
    },
    body: signedUrl
  };
}

const getFileNameInner = (event: APIGatewayProxyEvent): string => {
  const fileName = event.queryStringParameters?.name;
  if (!fileName) {
    throw new Error("File name is required");
  }
  return fileName;
}

const uploadFileInner = async (s3Client: S3Client, fileName: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: 'import-bucket-mycdkappstack',
    Key: `uploaded/${fileName}`,
    ContentType: 'text/csv'
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
