import { Cart } from '../models/cart.model';

export interface PricingRuleResult {
  discount: number;
  description: string;
}

export interface PricingRule {
  name: string;
  apply(cart: Cart): PricingRuleResult;
}

