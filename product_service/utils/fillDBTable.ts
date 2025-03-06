import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import products from './productsMock';
import stock from "./stockMock";

const client = new DynamoDBClient({
  region: "eu-central-1",
});

const docClient = DynamoDBDocumentClient.from(client);

async function batchUploadProductsToDynamoDB() {
  try {
    const putProductsRequests = products.map(product => ({
      PutRequest: {
        Item: product
      }
    }));

    const putStockRequests = stock.map(item => ({
      PutRequest: {
        Item: item
      }
    }));

    const requestItems: Record<string, any> = {};


    if (putProductsRequests.length > 0) {
      requestItems['rss-aws-shop-products'] = putProductsRequests;
    }

    if (putStockRequests.length > 0) {
      requestItems['rss-aws-shop-stocks'] = putStockRequests;
    }

    const command = new BatchWriteCommand({
      RequestItems: requestItems
    });

    const response = await docClient.send(command);
    console.log('DynamoDB response:', response);
    console.log('All products and stocks have been uploaded to DynamoDB');
  } catch (error) {
    console.error('Error uploading products and stocks to DynamoDB:', error);
  }
}

batchUploadProductsToDynamoDB();
