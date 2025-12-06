import { Cart } from '../models/cart.model';
import { PricingRule, PricingRuleResult } from './pricing-rule.interface';

const GOOGLE_HOME_SKU = '120P90';
const GOOGLE_HOME_PRICE = 49.99;

/**
 * Google Home Deal: Buy 3 Google Homes for the price of 2
 * For every 3 items, 1 is free
 */
export class GoogleHomeDealRule implements PricingRule {
  name = 'Google Home Deal (Buy 3 Pay 2)';

  apply(cart: Cart): PricingRuleResult {
    const cartItem = cart.items.get(GOOGLE_HOME_SKU);

    if (!cartItem) {
      return { discount: 0, description: '' };
    }

    const quantity = cartItem.quantity;
    const freeItems = Math.floor(quantity / 3);

    if (freeItems === 0) {
      return { discount: 0, description: '' };
    }

    const discount = freeItems * GOOGLE_HOME_PRICE;

    return {
      discount,
      description: `${this.name}: ${freeItems} free Google Home(s)`,
    };
  }
}

