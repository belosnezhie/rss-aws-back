import { test } from '@jest/globals';
import { isValidProductRequestData } from '../../utils/isValidProductRequestData'

test('it works', async () => {
  const input = JSON.stringify({
    title_test: 'test',
    description: 'test',
    price: 1,
    count: 1,
  });

  expect(isValidProductRequestData(input)).toBe(false);
})

