import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config/app.config';

interface ErrorResponse {
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleMongooseValidationError = (error: any): AppError => {
  if (error.name === 'ValidationError') {
    const errors: Record<string, string> = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
    return new AppError('Validation failed', 400, { errors });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new AppError(`${field} already exists`, 409);
  }

  if (error.name === 'CastError') {
    return new AppError('Invalid resource ID', 400);
  }

  return error;
};

export const globalErrorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (
    error.name === 'ValidationError' ||
    error.code === 11000 ||
    error.name === 'CastError'
  ) {
    error = handleMongooseValidationError(error);
  }

  let statusCode = 500;
  let message = 'Internal server error';
  let details: Record<string, unknown> | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  }

  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  const errorResponse: ErrorResponse = {
    message,
    ...(details && { details }),
  };

  if (config.env === 'development' && error.stack) {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
