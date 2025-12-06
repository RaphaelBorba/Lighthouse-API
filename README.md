# Lighthouse Checkout API

A shopping cart API with promotional pricing rules built with Express and TypeScript.

## Features

- **Product Catalog** - 4 products with different prices
- **Shopping Cart** - Session-based cart management
- **Promotional Rules** - Extensible pricing rules using Strategy pattern
  - Buy 3 Google Homes, pay for 2
  - Free Raspberry Pi with each MacBook Pro
  - 10% off Alexa Speakers when buying more than 3

## Tech Stack

- **Runtime:** Node.js 20
- **Language:** TypeScript
- **Framework:** Express.js
- **Session:** express-session (in-memory)
- **Logging:** Winston
- **Testing:** Jest + Supertest

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker (optional)

### Installation

```bash
# Clone and navigate to the api directory
cd api

# Install dependencies
npm install

# Run in development mode
npm run dev
```

The API will be available at `http://localhost:3000`

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t lighthouse-checkout-api .
docker run -p 3000:3000 lighthouse-checkout-api
```

## API Endpoints

### Health Check

```
GET /health
```

Returns API status.

### Products

```
GET /products
```

Returns all available products.

**Response:**
```json
{
  "products": [
    { "sku": "120P90", "name": "Google Home", "price": 49.99 },
    { "sku": "43N23P", "name": "Mac Pro", "price": 5399.99 },
    { "sku": "A304SD", "name": "Alexa Speaker", "price": 109.50 },
    { "sku": "344222", "name": "Raspberry Pi", "price": 30.00 }
  ]
}
```

### Checkout

#### Add Item to Cart

```
POST /checkout/scan
Content-Type: application/json

{ "sku": "120P90" }
```

**Response:**
```json
{
  "message": "Item added to cart",
  "item": {
    "sku": "120P90",
    "name": "Google Home",
    "price": 49.99,
    "quantity": 1
  }
}
```

#### View Cart

```
GET /checkout/cart
```

**Response:**
```json
{
  "items": [
    {
      "sku": "120P90",
      "name": "Google Home",
      "price": 49.99,
      "quantity": 3,
      "subtotal": 149.97
    }
  ],
  "itemCount": 3
}
```

#### Calculate Total

```
GET /checkout/total
```

**Response:**
```json
{
  "items": [...],
  "subtotal": 149.97,
  "discounts": [
    {
      "discount": 49.99,
      "description": "Google Home Deal (Buy 3 Pay 2): 1 free Google Home(s)"
    }
  ],
  "totalDiscount": 49.99,
  "total": 99.98
}
```

#### Clear Cart

```
DELETE /checkout/clear
```

**Response:**
```json
{
  "message": "Cart cleared"
}
```

## Promotional Rules

| Rule | Description | Logic |
|------|-------------|-------|
| **Google Home Deal** | Buy 3 Google Homes for the price of 2 | Every 3rd Google Home is free |
| **MacBook Bundle** | Each MacBook Pro comes with a free Raspberry Pi | Pi is auto-added when MacBook is scanned |
| **Alexa Bulk Discount** | 10% off Alexa Speakers when buying more than 3 | Discount applies only when quantity > 3 |

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
api/
├── src/
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access
│   ├── models/          # Type definitions
│   ├── rules/           # Pricing rules (Strategy pattern)
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utilities (logger)
│   ├── app.ts           # Express app setup
│   └── index.ts         # Entry point
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Architecture Decisions

### Strategy Pattern for Pricing Rules

Each pricing rule is implemented as a separate class that implements the `PricingRule` interface. This allows:

- Easy addition of new promotional rules
- Independent testing of each rule
- Rules can be enabled/disabled at runtime

### Session-Based Cart

Carts are stored in session memory, allowing each user to have their own cart. This is suitable for the demo but would need to be replaced with a persistent store (Redis, database) for production.

### Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
