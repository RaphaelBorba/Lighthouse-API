import { Router, Request, Response } from 'express';
import { productRepository } from '../repositories/product.repository';

const router = Router();

/**
 * GET /products
 * List all available products
 */
router.get('/', (req: Request, res: Response) => {
  const products = productRepository.findAll();
  res.json({ products });
});

export const productRouter = router;

