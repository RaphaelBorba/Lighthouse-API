import { Router, Request, Response, NextFunction } from 'express';
import { CheckoutService } from '../services/checkout.service';
import { Cart, createEmptyCart } from '../models/cart.model';
import { ApiError } from '../middleware/error-handler';

const router = Router();

/**
 * Helper to get or create CheckoutService from session
 */
const getCheckoutService = (req: Request): CheckoutService => {
  // Restore cart from session or create new one
  let cart: Cart;

  if (req.session.cart) {
    // Reconstruct Cart from session data
    cart = createEmptyCart();
    for (const item of req.session.cart.items) {
      cart.items.set(item.sku, {
        product: item.product,
        quantity: item.quantity,
      });
    }
  } else {
    cart = createEmptyCart();
  }

  return new CheckoutService(cart);
};

/**
 * Helper to save cart to session
 */
const saveCartToSession = (req: Request, service: CheckoutService): void => {
  const cart = service.getCart();
  req.session.cart = {
    items: Array.from(cart.items.entries()).map(([sku, item]) => ({
      sku,
      product: item.product,
      quantity: item.quantity,
    })),
  };
};

/**
 * POST /checkout/scan
 * Add item to cart
 * Body: { "sku": "120P90" }
 */
router.post('/scan', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.body;

    if (!sku || typeof sku !== 'string') {
      throw new ApiError(400, 'INVALID_REQUEST', 'SKU is required and must be a string');
    }

    const service = getCheckoutService(req);
    const item = service.scan(sku);
    saveCartToSession(req, service);

    res.status(201).json({
      message: 'Item added to cart',
      item: {
        sku: item.product.sku,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /checkout/cart
 * View current cart items
 */
router.get('/cart', (req: Request, res: Response) => {
  const service = getCheckoutService(req);
  const items = service.getItems();

  res.json({
    items: items.map((item) => ({
      sku: item.product.sku,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    })),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  });
});

/**
 * GET /checkout/total
 * Calculate total with promotions
 */
router.get('/total', (req: Request, res: Response) => {
  const service = getCheckoutService(req);
  const summary = service.calculateTotal();

  res.json(summary);
});

/**
 * DELETE /checkout/clear
 * Clear entire cart
 */
router.delete('/clear', (req: Request, res: Response) => {
  const service = getCheckoutService(req);
  service.clear();
  saveCartToSession(req, service);

  res.json({
    message: 'Cart cleared',
  });
});

export const checkoutRouter = router;

