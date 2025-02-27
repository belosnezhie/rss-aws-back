import { test } from '@jest/globals';
import { handler } from '../../lambdaFunctions/createProduct';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { Product } from '../../model/model';

test('it works', async () => {
  const input = JSON.stringify({
    title_test: 'test',
    description: 'test',
    price: 1,
    count: 1,
  });


  const isProduct = (item: any): item is Product => {
    return (
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.price === 'number' &&
      typeof item.description === 'string'
    );
  };

  expect(isProduct(input)).toBe(true);
})

