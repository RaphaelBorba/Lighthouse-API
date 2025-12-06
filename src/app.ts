import express, { Application } from 'express';
import session from 'express-session';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { productRouter } from './controllers/product.controller';
import { checkoutRouter } from './controllers/checkout.controller';

const app: Application = express();

// Middleware
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for cart management
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'lighthouse-checkout-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/products', productRouter);
app.use('/checkout', checkoutRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

