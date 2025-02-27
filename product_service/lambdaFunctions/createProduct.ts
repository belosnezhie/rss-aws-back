import { APIGatewayProxyResult, APIGatewayProxyHandler, Context } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand
} from "@aws-sdk/lib-dynamodb";
import { Product } from '../model/model';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const productsTableName = "rss-aws-shop-products";

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  const data = event.body;

  if (!data) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
      body: JSON.stringify({ message: 'Invalid request body' }),
    };
  }

  const isProduct = (item: any): item is Product => {
    return (
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.price === 'number' &&
      typeof item.description === 'string'
    );
  };

  const product: Product = JSON.parse(data)

  try {
    isProduct(product);
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
      body: JSON.stringify({ message: 'Invalid request body' }),
    };
  }

 await dynamo.send(
    new PutCommand({
      Item: product,
      TableName: productsTableName,
    })
  );

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
    },
    body: JSON.stringify(product),
  };
};
