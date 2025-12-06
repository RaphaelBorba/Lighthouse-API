import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: Map<string, CartItem>; // key is SKU
}

export const createEmptyCart = (): Cart => ({
  items: new Map(),
});

