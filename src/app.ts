import express, { Application } from 'express';
import session from 'express-session';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';

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

// Routes will be added here in later phases
// app.use('/products', productRoutes);
// app.use('/checkout', checkoutRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

