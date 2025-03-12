import { ProductRequest } from '../model/model'

export const isValidProductRequestData  = (item: any): item is ProductRequest => {
  if (!item.title || typeof item.title !== 'string') {
    throw new Error('Invalid title');
  }
  if (!item.description || typeof item.description !== 'string') {
    throw new Error('Invalid description');
  }
  if (typeof item.price !== 'number' || item.price <= 0) {
    throw new Error('Invalid price');
  }
  if (typeof item.count !== 'number' || item.count < 0) {
    throw new Error('Invalid count');
  }
  return true;
};
