import { test } from '@jest/globals';
import { handler } from '../../lambda_functions/getProductsById';
import { Context, APIGatewayProxyResult, APIGatewayEventRequestContextWithAuthorizer, APIGatewayEventDefaultAuthorizerContext } from 'aws-lambda';
import products from '../../lambda_functions/productsMock';

const customEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: '',
      isBase64Encoded: true,
      path: '',
      pathParameters: { ['productId']: ''},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
      resource: '',
}

test('getProductsById should return required product', async () => {
  const expected = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
    body: JSON.stringify(products[0]),
  }

  const event = customEvent;
  event.pathParameters.productId = '1';
  const context = {} as Context;

  const actual = await handler(event, context, () => { }) as APIGatewayProxyResult;
  expect(actual.statusCode).toBe(expected.statusCode);
  expect(actual.body).toBe(expected.body);
})

test('getProductsById should return 400 if ID is not provided', async () => {
  const expected = {
    statusCode: 400,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
    body: JSON.stringify({ message: 'Product ID is required' }),
  }

  const event = customEvent;
  event.pathParameters.productId = '';
  const context = {} as Context;

  const actual = await handler(event, context, () => { }) as APIGatewayProxyResult;
  expect(actual.statusCode).toBe(expected.statusCode);
  expect(actual.body).toBe(expected.body);
})

test('getProductsById should return 404 when product is not found', async () => {
  const expected = {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
    body: JSON.stringify({ message: 'Product not found' }),
  }

  const event = customEvent;
  event.pathParameters.productId = '8';
  const context = {} as Context;

  const actual = await handler(event, context, () => { }) as APIGatewayProxyResult;
  expect(actual.statusCode).toBe(expected.statusCode);
  expect(actual.body).toBe(expected.body);
})


