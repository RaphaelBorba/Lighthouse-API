export * from './pricing-rule.interface';
export * from './google-home-deal.rule';
export * from './macbook-bundle.rule';
export * from './alexa-bulk-discount.rule';

import { PricingRule } from './pricing-rule.interface';
import { GoogleHomeDealRule } from './google-home-deal.rule';
import { MacBookBundleRule } from './macbook-bundle.rule';
import { AlexaBulkDiscountRule } from './alexa-bulk-discount.rule';

// Default pricing rules to apply
export const defaultPricingRules: PricingRule[] = [
  new GoogleHomeDealRule(),
  new MacBookBundleRule(),
  new AlexaBulkDiscountRule(),
];

