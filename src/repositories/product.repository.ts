import { Product } from '../models/product.model';

const products: Product[] = [
  {
    sku: '120P90',
    name: 'Google Home',
    price: 49.99,
  },
  {
    sku: '43N23P',
    name: 'Mac Pro',
    price: 5399.99,
  },
  {
    sku: 'A304SD',
    name: 'Alexa Speaker',
    price: 109.50,
  },
  {
    sku: '344222',
    name: 'Raspberry Pi',
    price: 30.00,
  },
];

export class ProductRepository {
  findAll(): Product[] {
    return [...products];
  }

  findBySku(sku: string): Product | undefined {
    return products.find((product) => product.sku === sku);
  }

  exists(sku: string): boolean {
    return products.some((product) => product.sku === sku);
  }
}

export const productRepository = new ProductRepository();

