import express, { Application } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import slowDown from 'express-slow-down';
import { logger } from './utils/logger';
import userRoutes, { adminUserRoutes } from './routes/user.routes';
import studioRoutes, { adminStudioRoutes } from './routes/studio.routes';
import bookingRoutes, { adminBookingRoutes } from './routes/booking.routes';
import productRoutes, { adminProductRoutes } from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes, { adminOrderRoutes } from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';
import { initializeDatabase } from './utils/initDb';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server
const httpServer = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://checkout.razorpay.com", "https://accounts.google.com"],
      imgSrc: ["'self'", "data:", "http://localhost:*", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
      connectSrc: ["'self'", "https://lbs.razorpay.com", "https://api.razorpay.com"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// HTTP Request Logging
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) }
}));

// DDoS Protection - Slow down
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 500, // allow 500 requests per 15 minutes, then...
  delayMs: (hits) => hits * 100, // begin adding 100ms of delay per request
});
app.use(speedLimiter);

// Rate limiting (Global fallback)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // global max 1000 per IP
  message: (_req: any, _res: any) => {
    return { error: 'Too many requests, please try again later.' };
  }
});
app.use(limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static uploads folder locally
import path from 'path';
app.use('/uploads', (_req, res, next) => {
  // Allow the frontend (different origin) to load uploaded images
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/admin/studios', adminStudioRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './docs/swagger.json';

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Global Error Handler
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);

// Start server
const startServer = async (startPort: number) => {
  try {
    await initializeDatabase();
    console.log('✅ Database connected');
    console.log('✅ Email service initialized');
    
    let currentPort = startPort;
    let activeServer: any = null;

    const tryListen = (port: number) => {
      return new Promise((resolve, reject) => {
        console.log(`Attempting to start server on port ${port}...`);
        const srv = httpServer.listen(port)
          .once('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
              console.error(`Port ${port} is already occupied.`);
              resolve(false);
            } else {
              reject(err);
            }
          })
          .once('listening', () => {
            // Note: activeServer is used to track if it started successfully.
            activeServer = srv;
            console.log(`✅ Server running on port ${port}`);
            resolve(true);
          });
      });
    };

    while (!activeServer && currentPort < startPort + 10) {
      const success = await tryListen(currentPort);
      if (!success) {
        currentPort++;
      }
    }

    if (!activeServer) {
      console.error('❌ Could not find an available port.');
      process.exit(1);
    }

    // Process cleanup
    const gracefulShutdown = () => {
      console.log('\\nShutting down gracefully...');
      if (activeServer) {
        activeServer.close(() => {
          console.log('HTTP server closed.');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    console.error('❌ Server startup failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

// Only run server if this file is executed directly (prevents duplicate startup during tests)
if (require.main === module) {
  startServer(Number(PORT));
}

export default app;
