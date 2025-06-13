import { Request, Response, NextFunction } from 'express';
import {
  validateObjectId,
  validateEmail,
  validatePagination,
  validateSignupData,
  validateUpdateData,
  validatePassword,
  validateMakeConnectionRequestData,
  validateReviewConnectionRequestData,
} from '../utils/validators';
import { BadRequestError } from '../utils/errors';

export const validateHeaders = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const contentType = req.headers['content-type'];
    if (
      req.method === 'POST' ||
      req.method === 'PUT' ||
      req.method === 'PATCH'
    ) {
      if (!contentType || !contentType.includes('application/json')) {
        throw new BadRequestError('Content-Type must be application/json');
      }
    }

    const accept = req.headers.accept;
    if (accept && !accept.includes('application/json')) {
      throw new BadRequestError('Accept header must be application/json');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateQueryParams = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const sort = req.query.sort as string;
    if (sort) {
      const validSortFields = [
        'createdAt',
        'updatedAt',
        'firstName',
        'lastName',
      ];
      const [field, order] = sort.split(':');
      if (
        !field ||
        !validSortFields.includes(field) ||
        !order ||
        !['asc', 'desc'].includes(order.toLowerCase())
      ) {
        throw new BadRequestError(
          `Invalid sort parameter. Must be one of: ${validSortFields.join(', ')} with :asc or :desc`
        );
      }
    }

    const filter = req.query.filter as string;
    if (filter) {
      try {
        const filterObj = JSON.parse(filter);
        const validFilterFields = ['gender', 'age', 'skills'];
        const invalidFields = Object.keys(filterObj).filter(
          field => !validFilterFields.includes(field)
        );
        if (invalidFields.length > 0) {
          throw new BadRequestError(
            `Invalid filter fields: ${invalidFields.join(', ')}. Valid fields are: ${validFilterFields.join(', ')}`
          );
        }
      } catch (e) {
        throw new BadRequestError(
          'Invalid filter parameter format. Must be a valid JSON string'
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

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

export const validateMakeConnectionRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    validateMakeConnectionRequestData(req.params);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateReviewConnectionRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    validateReviewConnectionRequestData(req.params);
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

export const validatePasswordReset = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { password } = req.body;
    if (!password) {
      throw new BadRequestError('New password is required');
    }
    if (!validatePassword(password)) {
      throw new BadRequestError(
        'Password must be at least 8 characters long and contain at least one letter and one number'
      );
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
    req.pagination = { page, limit };
    next();
  } catch (error) {
    next(error);
  }
};
