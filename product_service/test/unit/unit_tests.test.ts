import { test } from '@jest/globals';
import { handler } from '../../lambda_functions/getProductsList';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import products from '../../lambda_functions/products_mock';

test('test', async () => {
  const expected = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
    body: JSON.stringify(products),
  }

  const event = {} as APIGatewayProxyEvent;
  const context = {} as Context;

  const actual = await handler(event, context, () => { }) as APIGatewayProxyResult;
  expect(actual.statusCode).toBe(expected.statusCode);
  // expect(actual.headers).toBe(expected.headers);
  expect(actual.body).toBe(expected.body);
})
