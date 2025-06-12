export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: Record<string, unknown> | undefined;
  public code: string | undefined;

  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, unknown>,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, details, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, undefined, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, undefined, 'CONFLICT');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super(message, 400, details, 'BAD_REQUEST');
  }
}
