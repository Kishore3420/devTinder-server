import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRouter';
import profileRoutes from './routes/profileRouter';
import connectionRequestsRoutes from './routes/connectionRequests';
import { globalErrorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './utils/errors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/requests', connectionRequestsRoutes);
app.use('/user', userRoutes);

app.all('*', (req, _res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  globalErrorHandler(err, req, res, next);
});

const gracefulShutdown = (signal: string): void => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

startServer();

export default app;
