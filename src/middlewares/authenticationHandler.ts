import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import { config } from '../config/app.config';

export const userAuthentication = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const { token } = req.cookies;
  if (!token) {
    return next(new BadRequestError('Authentication token is missing'));
  }
  try {
    const decodedToken = jwt.verify(token, config.jwt.secret);
    const userId = (decodedToken as { userId: string }).userId;
    if (!userId) {
      return next(new ConflictError('Invalid token'));
    }
    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      return next(new NotFoundError('User not found'));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new ValidationError('Authentication failed'));
  }
};
