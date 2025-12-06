import request from 'supertest';
import app from '../../src/app';

describe('Checkout API Integration Tests', () => {
  let agent: ReturnType<typeof request.agent>;

  beforeEach(() => {
    // Create agent to maintain cookies/session across requests
    agent = request.agent(app);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await agent.get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      const response = await agent.get('/products');

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(4);
      
      const skus = response.body.products.map((p: any) => p.sku);
      expect(skus).toContain('120P90'); // Google Home
      expect(skus).toContain('43N23P'); // Mac Pro
      expect(skus).toContain('A304SD'); // Alexa Speaker
      expect(skus).toContain('344222'); // Raspberry Pi
    });
  });

  describe('POST /checkout/scan', () => {
    it('should add item to cart', async () => {
      const response = await agent
        .post('/checkout/scan')
        .send({ sku: '120P90' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Item added to cart');
      expect(response.body.item.sku).toBe('120P90');
      expect(response.body.item.name).toBe('Google Home');
      expect(response.body.item.quantity).toBe(1);
    });

    it('should increment quantity when scanning same item', async () => {
      await agent.post('/checkout/scan').send({ sku: '120P90' });
      const response = await agent.post('/checkout/scan').send({ sku: '120P90' });

      expect(response.status).toBe(201);
      expect(response.body.item.quantity).toBe(2);
    });

    it('should return 404 for invalid SKU', async () => {
      const response = await agent
        .post('/checkout/scan')
        .send({ sku: 'INVALID' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('INVALID_SKU');
    });

    it('should return 400 for missing SKU', async () => {
      const response = await agent
        .post('/checkout/scan')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_REQUEST');
    });
  });

  describe('GET /checkout/cart', () => {
    it('should return empty cart initially', async () => {
      const response = await agent.get('/checkout/cart');

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(0);
      expect(response.body.itemCount).toBe(0);
    });

    it('should return cart items after scanning', async () => {
      await agent.post('/checkout/scan').send({ sku: '120P90' });
      await agent.post('/checkout/scan').send({ sku: 'A304SD' });

      const response = await agent.get('/checkout/cart');

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.itemCount).toBe(2);
    });
  });

  describe('GET /checkout/total', () => {
    it('should return zero total for empty cart', async () => {
      const response = await agent.get('/checkout/total');

      expect(response.status).toBe(200);
      expect(response.body.subtotal).toBe(0);
      expect(response.body.total).toBe(0);
      expect(response.body.discounts).toHaveLength(0);
    });

    it('should calculate total with discounts', async () => {
      // Add 3 Google Homes (buy 3 pay 2)
      await agent.post('/checkout/scan').send({ sku: '120P90' });
      await agent.post('/checkout/scan').send({ sku: '120P90' });
      await agent.post('/checkout/scan').send({ sku: '120P90' });

      const response = await agent.get('/checkout/total');

      expect(response.status).toBe(200);
      expect(response.body.subtotal).toBe(149.97);
      expect(response.body.totalDiscount).toBe(49.99);
      expect(response.body.total).toBe(99.98);
    });
  });

  describe('DELETE /checkout/clear', () => {
    it('should clear the cart', async () => {
      await agent.post('/checkout/scan').send({ sku: '120P90' });
      await agent.post('/checkout/scan').send({ sku: 'A304SD' });

      const clearResponse = await agent.delete('/checkout/clear');
      expect(clearResponse.status).toBe(200);
      expect(clearResponse.body.message).toBe('Cart cleared');

      const cartResponse = await agent.get('/checkout/cart');
      expect(cartResponse.body.items).toHaveLength(0);
    });
  });

  describe('Challenge Scenarios - Integration', () => {
    beforeEach(async () => {
      await agent.delete('/checkout/clear');
    });

    it('Scenario 1: MacBook Pro + Raspberry Pi = $5,399.99', async () => {
      await agent.post('/checkout/scan').send({ sku: '43N23P' });

      const response = await agent.get('/checkout/total');

      expect(response.body.total).toBe(5399.99);
    });

    it('Scenario 2: 3 Google Homes = $99.98', async () => {
      await agent.post('/checkout/scan').send({ sku: '120P90' });
      await agent.post('/checkout/scan').send({ sku: '120P90' });
      await agent.post('/checkout/scan').send({ sku: '120P90' });

      const response = await agent.get('/checkout/total');

      expect(response.body.total).toBe(99.98);
    });

    it('Scenario 3: 3 Alexa Speakers = $328.50 (no discount)', async () => {
      await agent.post('/checkout/scan').send({ sku: 'A304SD' });
      await agent.post('/checkout/scan').send({ sku: 'A304SD' });
      await agent.post('/checkout/scan').send({ sku: 'A304SD' });

      const response = await agent.get('/checkout/total');

      expect(response.body.total).toBe(328.50);
      expect(response.body.totalDiscount).toBe(0);
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await agent.get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});

