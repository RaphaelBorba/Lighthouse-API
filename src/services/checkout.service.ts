import { Cart, CartItem, createEmptyCart } from '../models/cart.model';
import { productRepository, ProductRepository } from '../repositories/product.repository';
import { PricingRule, PricingRuleResult, defaultPricingRules } from '../rules';
import { ApiError } from '../middleware/error-handler';

const MACBOOK_SKU = '43N23P';
const RASPBERRY_PI_SKU = '344222';

export interface CartSummary {
  items: Array<{
    sku: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  subtotal: number;
  discounts: PricingRuleResult[];
  totalDiscount: number;
  total: number;
}

export class CheckoutService {
  private cart: Cart;
  private productRepo: ProductRepository;
  private pricingRules: PricingRule[];

  constructor(
    cart?: Cart,
    productRepo?: ProductRepository,
    pricingRules?: PricingRule[]
  ) {
    this.cart = cart || createEmptyCart();
    this.productRepo = productRepo || productRepository;
    this.pricingRules = pricingRules || defaultPricingRules;
  }

  /**
   * Add an item to the cart by SKU (internal, no bundle logic)
   */
  private addItemToCart(sku: string): CartItem {
    const product = this.productRepo.findBySku(sku);

    if (!product) {
      throw new ApiError(404, 'INVALID_SKU', `Product with SKU '${sku}' not found`);
    }

    const existingItem = this.cart.items.get(sku);

    if (existingItem) {
      existingItem.quantity += 1;
      return existingItem;
    }

    const newItem: CartItem = {
      product,
      quantity: 1,
    };

    this.cart.items.set(sku, newItem);
    return newItem;
  }

  /**
   * Add an item to the cart by SKU
   * Automatically adds free Raspberry Pi when MacBook is added
   */
  scan(sku: string): CartItem {
    const item = this.addItemToCart(sku);

    // MacBook Bundle: Auto-add a free Raspberry Pi for each MacBook
    if (sku === MACBOOK_SKU) {
      this.addItemToCart(RASPBERRY_PI_SKU);
    }

    return item;
  }

  /**
   * Clear all items from the cart
   */
  clear(): void {
    this.cart.items.clear();
  }

  /**
   * Get all items in the cart
   */
  getItems(): CartItem[] {
    return Array.from(this.cart.items.values());
  }

  /**
   * Get the cart instance (for session storage)
   */
  getCart(): Cart {
    return this.cart;
  }

  /**
   * Calculate subtotal before discounts
   */
  private calculateSubtotal(): number {
    let subtotal = 0;

    for (const item of this.cart.items.values()) {
      subtotal += item.product.price * item.quantity;
    }

    return subtotal;
  }

  /**
   * Apply all pricing rules and get discounts
   */
  private applyPricingRules(): PricingRuleResult[] {
    const discounts: PricingRuleResult[] = [];

    for (const rule of this.pricingRules) {
      const result = rule.apply(this.cart);
      if (result.discount > 0) {
        discounts.push(result);
      }
    }

    return discounts;
  }

  /**
   * Calculate the total with all discounts applied
   */
  calculateTotal(): CartSummary {
    const items = this.getItems().map((item) => ({
      sku: item.product.sku,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const subtotal = this.calculateSubtotal();
    const discounts = this.applyPricingRules();
    const totalDiscount = discounts.reduce((sum, d) => sum + d.discount, 0);
    const total = Math.max(0, subtotal - totalDiscount);

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discounts,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}

