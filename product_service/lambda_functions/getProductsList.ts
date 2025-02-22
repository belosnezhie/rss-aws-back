import { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import products from './productsMock';

export const handler: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
    body: JSON.stringify(products),
  };
};
