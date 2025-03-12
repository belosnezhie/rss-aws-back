
import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { AvailibleProduct } from '../model/model';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const productsTableName = process.env.PRODUCTS_TABLE;
const stockTableName = process.env.STOCKS_TABLE;


export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  console.log('Incoming request:', event);

  try {
    const productsResponse = await dynamo.send(
      new ScanCommand({
        TableName: productsTableName,
      })
    );

    const stocksResponse = await dynamo.send(
      new ScanCommand({
        TableName: stockTableName,
      })
    );

    const products = productsResponse.Items || [];
    const stocks = stocksResponse.Items || [];

    const joinedProducts: AvailibleProduct[] = products.map(product => {
      const stockItem = stocks.find(stock => stock.product_id === product.id);
      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        count: stockItem ? stockItem.count : 0
      };
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify(joinedProducts),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
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
