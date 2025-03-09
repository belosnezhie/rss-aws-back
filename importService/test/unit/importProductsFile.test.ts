import { S3Client } from "@aws-sdk/client-s3";
import { innerHandler } from "../../lambdaFunctions/importProductsFile";
import { customEvent } from "./testData";

describe('importProductsFile lambda function', () => {
  it('returns Error if there is no fileName', async () => {
    // Arrage
    const getFileNameInner = jest.fn(() => { throw new Error(); });
    const uploadFileInner = jest.fn(async (s3Client: S3Client, fileName: string) => "url");

    // Act
    const response = await innerHandler(customEvent, getFileNameInner, uploadFileInner);

    // Assert
    expect(response).toStrictEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'File name is required' })
    })
  });


  it('returns Error if there is an error during the file upload', async () => {
    // Arrage
    const getFileNameInner = jest.fn(() => "");
    const uploadFileInner = jest.fn(async (s3Client: S3Client, fileName: string) => { throw new Error(); });

    // Act
    const response = await innerHandler(customEvent, getFileNameInner, uploadFileInner);

    // Assert
    expect(response).toStrictEqual({
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    })
  });

  it('return OK if there is a happy path scenario', async () => {
    // Arrange
    const getFileNameInner = jest.fn(() => "");
    const uploadFileInner = jest.fn(async (s3Client: S3Client, fileName: string) => "url");

    // Act
    const response = await innerHandler(customEvent, getFileNameInner, uploadFileInner);

    // Assert
    expect(response).toStrictEqual({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
      },
      body: "url",
    })
  });
});
