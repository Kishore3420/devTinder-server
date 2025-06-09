// middlewares/validation.ts
import { Request, Response, NextFunction } from 'express';
import {
  validateObjectId,
  validateEmail,
  validatePagination,
  validateSignupData,
  validateUpdateData,
} from '../utils/validators';
import { BadRequestError } from '../utils/errors';

export const validateSignup = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    validateSignupData(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      throw new BadRequestError('Email and password are required');
    }
    if (!validateEmail(emailId)) {
      throw new BadRequestError('Please provide a valid email address');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new BadRequestError('No update data provided');
    }
    validateUpdateData(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUserId = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    if (!validateObjectId(userId)) {
      throw new BadRequestError('Invalid user ID format');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateEmailQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const emailId = req.query.emailId as string;

    if (!emailId) {
      throw new BadRequestError('Email query parameter is required');
    }

    if (!validateEmail(emailId)) {
      throw new BadRequestError('Please provide a valid email address');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validatePaginationQuery = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!validatePagination(page, limit)) {
      throw new BadRequestError(
        'Invalid pagination parameters. Page must be >= 1, limit must be 1-100'
      );
    }

    // Attach validated values to request for use in controller
    req.pagination = { page, limit };
    next();
  } catch (error) {
    next(error);
  }
};
