import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user';
import { User } from '../types';
import { NotFoundError, ConflictError } from '../utils/errors';

const { BCRYPT_SALT_ROUNDS } = process.env;

export const signup = async (req: Request, res: Response): Promise<void> => {
  const {
    firstName,
    lastName,
    emailId,
    password,
    age,
    gender,
    photoUrl,
    about,
    skills,
  } = req.body;

  const existingUser = await UserModel.findOne({
    emailId: emailId.toLowerCase(),
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  const saltRounds = BCRYPT_SALT_ROUNDS ? parseInt(BCRYPT_SALT_ROUNDS, 10) : 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const userObj: Partial<User> = {
    firstName: firstName.trim(),
    lastName: lastName?.trim() || '',
    emailId: emailId.toLowerCase().trim(),
    password: hashedPassword,
  };

  if (age) {
    userObj.age = age;
  }
  if (gender) {
    userObj.gender = gender;
  }
  if (photoUrl) {
    userObj.photoUrl = photoUrl.trim();
  }
  if (about) {
    userObj.about = about.trim();
  }
  if (skills) {
    userObj.skills = skills.map((skill: string) => skill.trim());
  }

  const user = new UserModel(userObj);
  const savedUser = await user.save();

  const userResponse = savedUser.getPublicProfile();

  res.status(201).json({
    message: 'User created successfully',
    user: userResponse,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { emailId, password } = req.body;

  const user = await UserModel.findOne({
    emailId: emailId.toLowerCase(),
  }).select('+password');

  if (!user) {
    throw new NotFoundError('User not found');
  }
  const isPasswordValid = user.verifyPassword(password);
  if (!isPasswordValid) {
    throw new NotFoundError('Invalid email or password');
  }

  const token = await user.getJWT();
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000,
  });

  const userResponse = user.getPublicProfile();

  res.status(200).json({
    message: 'Login successful',
    user: userResponse,
  });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    message: 'Logout successful',
  });
};
