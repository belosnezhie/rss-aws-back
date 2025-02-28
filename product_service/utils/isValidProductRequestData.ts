import { ProductRequest } from '../model/model'

export const isValidProductRequestData  = (item: any): item is ProductRequest => {
  return (
    typeof item.title === 'string' &&
    typeof item.price === 'number' &&
    typeof item.description === 'string' &&
    typeof item.count === 'number'
  );
};
