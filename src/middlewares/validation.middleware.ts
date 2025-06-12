import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { BadRequestError } from '../utils/errors';

export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorObject: Record<string, string> = {};
    errors.array().forEach(err => {
      errorObject[err.type] = err.msg;
    });

    throw new BadRequestError('Validation failed', errorObject);
  };
};
