import { Request, Response } from 'express';
import { UserModel } from '../models/user';
import { User } from '../types';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { sanitizeUserData } from '../utils/sanitize';
import bcrypt from 'bcrypt';
import { config } from '../config/app.config';

export const view = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as User;
  if (!user) {
    throw new NotFoundError('User not found');
  }
  const sanitizedUser = user.getPublicProfile();
  res.status(200).json(sanitizedUser);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?._id;
  if (!userId) {
    throw new NotFoundError('User not found');
  }

  const data = req.body;

  const sanitizedData = sanitizeUserData(data);

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { $set: sanitizedData },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }
  res.status(200).json({
    message: 'User updated successfully',
    user: updatedUser.getPublicProfile(),
  });
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?._id;
  if (!userId) {
    throw new NotFoundError('User not found');
  }
  const { password } = req.body;
  if (!password) {
    throw new BadRequestError('Password is required');
  }
  const hashedPassword = await bcrypt.hash(password, config.jwt.saltRounds);

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true, runValidators: true }
  );
  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: config.env === 'production',
  });

  res.status(200).json({
    message:
      'Password reset successfully. Please login with your new password.',
  });
};
