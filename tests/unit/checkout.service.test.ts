import { CheckoutService } from '../../src/services/checkout.service';
import { createEmptyCart } from '../../src/models/cart.model';



describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(() => {
    service = new CheckoutService();
  });

  describe('scan', () => {
    it('should add an item to the cart', () => {
      const item = service.scan('120P90'); // Google Home

      expect(item.product.sku).toBe('120P90');
      expect(item.product.name).toBe('Google Home');
      expect(item.quantity).toBe(1);
    });

    it('should increment quantity when scanning same item', () => {
      service.scan('120P90');
      const item = service.scan('120P90');

      expect(item.quantity).toBe(2);
    });

    it('should throw error for invalid SKU', () => {
      expect(() => service.scan('INVALID')).toThrow('Product with SKU \'INVALID\' not found');
    });

    it('should auto-add Raspberry Pi when scanning MacBook', () => {
      service.scan('43N23P'); // MacBook Pro

      const items = service.getItems();
      expect(items).toHaveLength(2);
      
      const macbook = items.find(i => i.product.sku === '43N23P');
      const pi = items.find(i => i.product.sku === '344222');
      
      expect(macbook).toBeDefined();
      expect(pi).toBeDefined();
      expect(pi?.quantity).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all items from cart', () => {
      service.scan('120P90');
      service.scan('A304SD');
      service.clear();

      expect(service.getItems()).toHaveLength(0);
    });
  });

  describe('getItems', () => {
    it('should return empty array for empty cart', () => {
      expect(service.getItems()).toHaveLength(0);
    });

    it('should return all items in cart', () => {
      service.scan('120P90');
      service.scan('A304SD');

      expect(service.getItems()).toHaveLength(2);
    });
  });

  describe('calculateTotal - Challenge Scenarios', () => {
    /**
     * Scenario 1: MacBook Pro + Raspberry Pi
     * Expected Total: $5,399.99
     * (Raspberry Pi is free with MacBook)
     */
    it('Scenario 1: MacBook Pro + Raspberry Pi = $5,399.99', () => {
      service.scan('43N23P'); // MacBook Pro (auto-adds Pi)

      const summary = service.calculateTotal();

      expect(summary.subtotal).toBe(5429.99); // MacBook + Pi
      expect(summary.totalDiscount).toBe(30.00); // Free Pi
      expect(summary.total).toBe(5399.99);
      expect(summary.discounts).toHaveLength(1);
      expect(summary.discounts[0].description).toContain('MacBook Bundle');
    });

    /**
     * Scenario 2: 3 Google Homes
     * Expected Total: $99.98
     * (Buy 3 for price of 2)
     */
    it('Scenario 2: 3 Google Homes = $99.98', () => {
      service.scan('120P90');
      service.scan('120P90');
      service.scan('120P90');

      const summary = service.calculateTotal();

      expect(summary.subtotal).toBe(149.97); // 3 x $49.99
      expect(summary.totalDiscount).toBe(49.99); // 1 free
      expect(summary.total).toBe(99.98);
      expect(summary.discounts).toHaveLength(1);
      expect(summary.discounts[0].description).toContain('Google Home Deal');
    });

    /**
     * Scenario 3: 3 Alexa Speakers
     * Expected Total: $328.50
     * (No discount - need MORE than 3 for 10% off)
     */
    it('Scenario 3: 3 Alexa Speakers = $328.50 (no discount)', () => {
      service.scan('A304SD');
      service.scan('A304SD');
      service.scan('A304SD');

      const summary = service.calculateTotal();

      expect(summary.subtotal).toBe(328.50); // 3 x $109.50
      expect(summary.totalDiscount).toBe(0);
      expect(summary.total).toBe(328.50);
      expect(summary.discounts).toHaveLength(0);
    });
  });

  describe('calculateTotal - Additional Pricing Rules', () => {
    it('should apply 10% discount for more than 3 Alexa Speakers', () => {
      service.scan('A304SD');
      service.scan('A304SD');
      service.scan('A304SD');
      service.scan('A304SD'); // 4th Alexa triggers discount

      const summary = service.calculateTotal();

      expect(summary.subtotal).toBe(438.00); // 4 x $109.50
      expect(summary.totalDiscount).toBe(43.80); // 10% off
      expect(summary.total).toBe(394.20);
      expect(summary.discounts).toHaveLength(1);
      expect(summary.discounts[0].description).toContain('Alexa Bulk Discount');
    });

    it('should apply multiple discounts together', () => {
      // 3 Google Homes (1 free) + 1 MacBook (free Pi)
      service.scan('120P90');
      service.scan('120P90');
      service.scan('120P90');
      service.scan('43N23P');

      const summary = service.calculateTotal();

      // Subtotal: 3 x $49.99 + $5399.99 + $30.00 = $5579.96
      expect(summary.subtotal).toBe(5579.96);
      
      // Discounts: $49.99 (Google Home) + $30.00 (Pi) = $79.99
      expect(summary.totalDiscount).toBe(79.99);
      
      // Total: $5579.96 - $79.99 = $5499.97
      expect(summary.total).toBe(5499.97);
      
      expect(summary.discounts).toHaveLength(2);
    });

    it('should apply all three discounts together', () => {
      // 3 Google Homes + 4 Alexa + 1 MacBook
      service.scan('120P90');
      service.scan('120P90');
      service.scan('120P90');
      service.scan('A304SD');
      service.scan('A304SD');
      service.scan('A304SD');
      service.scan('A304SD');
      service.scan('43N23P');

      const summary = service.calculateTotal();

      expect(summary.discounts).toHaveLength(3);
      
      const googleDiscount = summary.discounts.find(d => d.description.includes('Google Home'));
      const alexaDiscount = summary.discounts.find(d => d.description.includes('Alexa'));
      const macbookDiscount = summary.discounts.find(d => d.description.includes('MacBook'));
      
      expect(googleDiscount).toBeDefined();
      expect(alexaDiscount).toBeDefined();
      expect(macbookDiscount).toBeDefined();
    });

    it('should handle 6 Google Homes (2 free)', () => {
      for (let i = 0; i < 6; i++) {
        service.scan('120P90');
      }

      const summary = service.calculateTotal();

      expect(summary.subtotal).toBe(299.94); // 6 x $49.99
      expect(summary.totalDiscount).toBe(99.98); // 2 free
      expect(summary.total).toBe(199.96); // Pay for 4
    });

    it('should handle 2 MacBooks (2 free Pis)', () => {
      service.scan('43N23P');
      service.scan('43N23P');

      const summary = service.calculateTotal();

      const items = service.getItems();
      const piItem = items.find(i => i.product.sku === '344222');
      expect(piItem?.quantity).toBe(2);

      expect(summary.totalDiscount).toBe(60.00); // 2 free Pis
    });
  });

  describe('calculateTotal - Edge Cases', () => {
    it('should return zero total for empty cart', () => {
      const summary = service.calculateTotal();

      expect(summary.items).toHaveLength(0);
      expect(summary.subtotal).toBe(0);
      expect(summary.totalDiscount).toBe(0);
      expect(summary.total).toBe(0);
    });

    it('should handle single item with no discount', () => {
      service.scan('120P90'); // 1 Google Home

      const summary = service.calculateTotal();

      expect(summary.subtotal).toBe(49.99);
      expect(summary.totalDiscount).toBe(0);
      expect(summary.total).toBe(49.99);
    });
  });
});

