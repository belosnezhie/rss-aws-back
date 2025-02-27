interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    price: 100,
    description: 'Product 1 description',
  },
  {
    id: '2',
    name: 'Product 2',
    price: 200,
    description: 'Product 2 description',
  },
  {
    id: '3',
    name: 'Product 3',
    price: 300,
    description: 'Product 3 description',
  },
  {
    id: '4',
    name: 'Product 4',
    price: 400,
    description: 'Product 4 description',
  }
]

export default products;
