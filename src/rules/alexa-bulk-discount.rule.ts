import { Cart } from '../models/cart.model';
import { PricingRule, PricingRuleResult } from './pricing-rule.interface';

const ALEXA_SKU = 'A304SD';
const DISCOUNT_THRESHOLD = 3; // Discount applies when MORE than 3
const DISCOUNT_PERCENTAGE = 0.10; // 10% discount

/**
 * Alexa Bulk Discount: Buying MORE than 3 Alexa Speakers triggers a 10% discount on all Alexas
 */
export class AlexaBulkDiscountRule implements PricingRule {
  name = 'Alexa Bulk Discount (10% off for >3)';

  apply(cart: Cart): PricingRuleResult {
    const cartItem = cart.items.get(ALEXA_SKU);

    if (!cartItem) {
      return { discount: 0, description: '' };
    }

    const quantity = cartItem.quantity;

    // Discount only applies when quantity is MORE than 3 (not 3 or more)
    if (quantity <= DISCOUNT_THRESHOLD) {
      return { discount: 0, description: '' };
    }

    const totalAlexaPrice = cartItem.product.price * quantity;
    const discount = totalAlexaPrice * DISCOUNT_PERCENTAGE;

    return {
      discount,
      description: `${this.name}: 10% off ${quantity} Alexa Speaker(s)`,
    };
  }
}

