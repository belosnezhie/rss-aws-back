import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { AvailibleProduct } from '../model/model';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const productsTableName = process.env.PRODUCTS_TABLE;
const stockTableName = process.env.STOCKS_TABLE;

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  console.log('Incoming request:', event);

  try {
    const productId = event.pathParameters?.productId;

    if (!productId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
        body: JSON.stringify({ message: 'Product ID is required' }),
      };
    }

    const productResponse = await dynamo.send(
      new GetCommand({
        TableName: productsTableName,
        Key: {
          id: productId
        }
      })
    );

    const product = productResponse.Item;

    if (!product) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    const stockResponse = await dynamo.send(
      new GetCommand({
        TableName: stockTableName,
        Key: {
          product_id: productId
        }
      })
    );

    const stock = stockResponse.Item;

    const availableProduct: AvailibleProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      count: stock ? stock.count : 0
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify(availableProduct),
    };

  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
