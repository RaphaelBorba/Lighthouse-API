import { Cart } from '../models/cart.model';

declare module 'express-session' {
  interface SessionData {
    cart?: {
      items: Array<{
        sku: string;
        product: {
          sku: string;
          name: string;
          price: number;
        };
        quantity: number;
      }>;
    };
  }
}

