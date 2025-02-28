import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { AvailibleProduct, ProductRequest } from '../model/model';
import { isValidProductRequestData } from '../utils/isValidProductRequestData';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const productsTableName = "rss-aws-shop-products";
const stockTableName = "rss-aws-shop-stocks";

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  console.log('Incoming request:', event);

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
        },
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }

    const productData: ProductRequest = JSON.parse(event.body);

    if (!isValidProductRequestData(productData)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
        },
        body: JSON.stringify({ message: 'Invalid product data. Required fields: title, description, price, count' }),
      };
    }

    const productId = uuidv4();

    const transactionItems = [
      {
        Put: {
          TableName: productsTableName,
          Item: {
            id: productId,
            title: productData.title,
            description: productData.description,
            price: productData.price,
          },
          ConditionExpression: "attribute_not_exists(id)"
        }
      },
      {
        Put: {
          TableName: stockTableName,
          Item: {
            product_id: productId,
            count: productData.count
          },
          ConditionExpression: "attribute_not_exists(product_id)"
        }
      }
    ];

    await dynamo.send(
      new TransactWriteCommand({
        TransactItems: transactionItems
      })
    );

    const createdProduct: AvailibleProduct = {
      id: productId,
      title: productData.title,
      description: productData.description,
      price: productData.price,
      count: productData.count
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
      body: JSON.stringify(`Product was created: ${createdProduct}`),
    };

  } catch (error) {
    console.error('Error creating product:', error);

    if (error instanceof Error && error.name === 'TransactionCanceledException') {
      return {
        statusCode: 409,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
        },
        body: JSON.stringify({
          message: 'Transaction failed. Product might already exist.'
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};
