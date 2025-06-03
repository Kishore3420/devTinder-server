import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import { globalErrorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './utils/errors';

const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use('/', userRoutes);

// Handle 404 errors
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global error handling middleware (must be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  globalErrorHandler(err, req, res, next);
});

// Graceful shutdown handler
const gracefulShutdown = (signal: string): void => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  process.exit(0);
};

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Connect to the database and start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
