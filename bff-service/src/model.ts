export type PutCartPayload = {
  product: { description: string; id: string; title: string; price: number };
  count: number;
};

export type CreateOrderDto = {
  items: Array<{ productId: string; count: 1 }>;
  address: {
    comment: string;
    address: string;
    lastName: string;
    firstName: string;
  };
};
