import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user';
import { User } from '../types';
import { NotFoundError, ConflictError } from '../utils/errors';

const { BCRYPT_SALT_ROUNDS } = process.env;

// Helper function to sanitize user data
const sanitizeUserData = (data: User): Partial<User> => {
  const sanitized: User = { ...data };

  if (sanitized.firstName) {
    sanitized.firstName = sanitized.firstName.trim();
  }
  if (sanitized.lastName) {
    sanitized.lastName = sanitized.lastName.trim();
  }
  if (sanitized.emailId) {
    sanitized.emailId = sanitized.emailId.toLowerCase().trim();
  }
  if (sanitized.photoUrl) {
    sanitized.photoUrl = sanitized.photoUrl.trim();
  }
  if (sanitized.about) {
    sanitized.about = sanitized.about.trim();
  }
  if (sanitized.skills && Array.isArray(sanitized.skills)) {
    sanitized.skills = sanitized.skills.map((skill: string) => skill.trim());
  }

  return sanitized;
};

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

  // Check if user already exists
  const existingUser = await UserModel.findOne({
    emailId: emailId.toLowerCase(),
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const saltRounds = BCRYPT_SALT_ROUNDS ? parseInt(BCRYPT_SALT_ROUNDS, 10) : 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Prepare user object
  const userObj: Partial<User> = {
    firstName: firstName.trim(),
    lastName: lastName?.trim() || '',
    emailId: emailId.toLowerCase().trim(),
    password: hashedPassword,
  };

  // Add optional fields if provided
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

  // Remove password from response
  const userResponse = savedUser.getPublicProfile();

  res.status(201).json({
    message: 'User created successfully',
    user: userResponse,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { emailId, password } = req.body;

  // Find user by email
  const user = await UserModel.findOne({
    emailId: emailId.toLowerCase(),
  }).select('+password');

  if (!user) {
    throw new NotFoundError('User not found');
  }
  // Check password
  const isPasswordValid = user.validatePassword(password);
  if (!isPasswordValid) {
    throw new NotFoundError('Invalid email or password');
  }

  // Generate a token
  const token = await user.getJWT();
  // Set token in cookies
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 3600000, // 1 hour
  });

  const userResponse = user.getPublicProfile();

  res.status(200).json({
    message: 'Login successful',
    user: userResponse,
  });
};

export const getUserByEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const emailId = req.query.emailId as string;

  const user = await UserModel.findOne({
    emailId: emailId.toLowerCase(),
  }).select('-password');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json(user);
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.userId;

  const user = await UserModel.findById(userId).select('-password');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json(user);
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = req.pagination?.page ?? 1;
  const limit = req.pagination?.limit ?? 10;
  const skip = (page - 1) * limit;

  const users = await UserModel.find()
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await UserModel.countDocuments();
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.userId;
  const data = req.body;

  // Sanitize data
  const sanitizedData = sanitizeUserData(data);

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: sanitizedData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    message: 'User updated successfully',
    user,
  });
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.userId;

  const user = await UserModel.findByIdAndDelete(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    message: 'User deleted successfully',
  });
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = req.user;

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    message: 'User profile retrieved successfully',
    user,
  });
};
