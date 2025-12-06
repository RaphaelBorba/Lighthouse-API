import { Cart } from '../models/cart.model';
import { PricingRule, PricingRuleResult } from './pricing-rule.interface';

const MACBOOK_SKU = '43N23P';
const RASPBERRY_PI_SKU = '344222';
const RASPBERRY_PI_PRICE = 30.00;

/**
 * MacBook Bundle Deal: Each MacBook Pro comes with a free Raspberry Pi
 * For each MacBook in cart, one Raspberry Pi is free (up to the number of Pis in cart)
 */
export class MacBookBundleRule implements PricingRule {
  name = 'MacBook Bundle (Free Raspberry Pi)';

  apply(cart: Cart): PricingRuleResult {
    const macBookItem = cart.items.get(MACBOOK_SKU);
    const raspberryPiItem = cart.items.get(RASPBERRY_PI_SKU);

    if (!macBookItem || !raspberryPiItem) {
      return { discount: 0, description: '' };
    }

    const macBookQuantity = macBookItem.quantity;
    const raspberryPiQuantity = raspberryPiItem.quantity;

    // Free Pis = minimum of MacBooks and Pis in cart
    const freePis = Math.min(macBookQuantity, raspberryPiQuantity);

    if (freePis === 0) {
      return { discount: 0, description: '' };
    }

    const discount = freePis * RASPBERRY_PI_PRICE;

    return {
      discount,
      description: `${this.name}: ${freePis} free Raspberry Pi(s)`,
    };
  }
}

