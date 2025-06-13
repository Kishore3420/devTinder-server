import validator from 'validator';
import mongoose from 'mongoose';
import { User } from '../types/user';
import { BadRequestError, ValidationError } from './errors';
import { ConnectionRequests } from '../types';

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email must be a non-empty string');
  }
  if (email.length > 254) {
    throw new ValidationError(
      'Email address is too long (maximum 254 characters)'
    );
  }
  return validator.isEmail(email);
};

export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password must be a non-empty string');
  }
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }
  if (password.length > 128) {
    throw new ValidationError('Password is too long (maximum 128 characters)');
  }
  if (!/[A-Z]/.test(password)) {
    throw new ValidationError(
      'Password must contain at least one uppercase letter'
    );
  }
  if (!/[a-z]/.test(password)) {
    throw new ValidationError(
      'Password must contain at least one lowercase letter'
    );
  }
  if (!/[0-9]/.test(password)) {
    throw new ValidationError('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new ValidationError(
      'Password must contain at least one special character'
    );
  }
  return true;
};

export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('Name must be a non-empty string');
  }
  if (name.length < 2) {
    throw new ValidationError('Name must be at least 2 characters long');
  }
  if (name.length > 50) {
    throw new ValidationError('Name is too long (maximum 50 characters)');
  }
  if (!validator.isAlpha(name, 'en-US', { ignore: " -'" })) {
    throw new ValidationError(
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    );
  }
  return true;
};

export const validateObjectId = (id: string): boolean => {
  console.log(id);
  if (!id) {
    throw new ValidationError('ID must be a non-empty string');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid ID format');
  }
  return true;
};

export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('URL must be a non-empty string');
  }
  if (url.length > 2048) {
    throw new ValidationError('URL is too long (maximum 2048 characters)');
  }
  if (
    !validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      require_tld: false,
      allow_underscores: true,
    })
  ) {
    throw new ValidationError('URL must be a valid HTTP or HTTPS URL');
  }
  return true;
};

export const validateAge = (age: number): boolean => {
  if (typeof age !== 'number' || isNaN(age)) {
    throw new ValidationError('Age must be a valid number');
  }
  if (age < 16) {
    throw new ValidationError('Age must be at least 16 years old');
  }
  if (age > 50) {
    throw new ValidationError('Age must be 50 years or younger');
  }
  return true;
};

export const validateGender = (gender: string): boolean => {
  if (!gender || typeof gender !== 'string') {
    throw new ValidationError('Gender must be a non-empty string');
  }
  const validGenders = ['M', 'F', 'O'];
  if (!validGenders.includes(gender)) {
    throw new ValidationError(
      `Gender must be one of: ${validGenders.join(', ')}`
    );
  }
  return true;
};

export const validateStatus = (status: string): boolean => {
  if (!status || typeof status !== 'string') {
    throw new ValidationError('Status must be a non-empty string');
  }
  const validStatuses = ['ignore', 'interested', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(
      `Status must be one of: ${validStatuses.join(', ')}`
    );
  }
  return true;
};

export const validateSkills = (skills: string[]): boolean => {
  if (!Array.isArray(skills)) {
    throw new ValidationError('Skills must be an array');
  }
  if (skills.length === 0) {
    throw new ValidationError('At least one skill must be provided');
  }
  if (skills.length > 10) {
    throw new ValidationError('Maximum 10 skills allowed');
  }

  const invalidSkills = skills.filter(
    skill =>
      typeof skill !== 'string' ||
      skill.trim().length === 0 ||
      skill.length > 50
  );

  if (invalidSkills.length > 0) {
    throw new ValidationError(
      'Each skill must be a non-empty string with maximum 50 characters'
    );
  }

  const uniqueSkills = new Set(skills.map(s => s.toLowerCase()));
  if (uniqueSkills.size !== skills.length) {
    throw new ValidationError('Duplicate skills are not allowed');
  }

  return true;
};

export const validateAbout = (about: string): boolean => {
  if (!about || typeof about !== 'string') {
    throw new ValidationError('About must be a non-empty string');
  }
  if (about.length > 500) {
    throw new ValidationError('About section cannot exceed 500 characters');
  }
  if (about.trim().length === 0) {
    throw new ValidationError('About section cannot be empty');
  }
  return true;
};

export const validatePagination = (page: number, limit: number): boolean => {
  if (typeof page !== 'number' || isNaN(page) || page < 1) {
    throw new ValidationError('Page number must be a positive number');
  }
  if (typeof limit !== 'number' || isNaN(limit) || limit < 1 || limit > 100) {
    throw new ValidationError('Limit must be a number between 1 and 100');
  }
  return true;
};

export const validateSignupData = (data: User): void => {
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
  } = data;

  if (!firstName || !lastName || !emailId || !password) {
    throw new ValidationError('All required fields must be provided', {
      required: ['firstName', 'lastName', 'emailId', 'password'],
    });
  }

  if (!validateName(firstName)) {
    throw new ValidationError(
      'First name must contain only letters, and spaces'
    );
  }

  if (lastName && !validateName(lastName)) {
    throw new ValidationError(
      'Last name must contain only letters, and spaces'
    );
  }

  if (!validateEmail(emailId)) {
    throw new ValidationError('Please provide a valid email address');
  }

  if (!validatePassword(password)) {
    throw new ValidationError(
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    );
  }

  if (age && !validateAge(age)) {
    throw new ValidationError('Age must be between 16 and 50');
  }

  if (gender && !validateGender(gender)) {
    throw new ValidationError('Gender must be M, F, or O');
  }

  if (photoUrl && photoUrl.trim() && !validateUrl(photoUrl)) {
    throw new ValidationError('Photo URL must be a valid URL');
  }

  if (about && !validateAbout(about)) {
    throw new ValidationError('About section cannot exceed 500 characters');
  }

  if (skills && !validateSkills(skills)) {
    throw new ValidationError(
      'Skills must be an array of max 10 non-empty strings (max 50 chars each)'
    );
  }
};

export const validateUpdateData = (data: User): void => {
  const allowedFields = [
    'firstName',
    'lastName',
    'age',
    'gender',
    'photoUrl',
    'about',
    'skills',
  ];

  const updateKeys = Object.keys(data);
  const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));

  if (invalidFields.length > 0) {
    throw new ValidationError('Invalid fields for update', {
      invalidFields,
      allowedFields,
    });
  }

  if (data.firstName && !validateName(data.firstName)) {
    throw new ValidationError(
      'First name must contain only letters and spaces'
    );
  }

  if (data.lastName && !validateName(data.lastName)) {
    throw new ValidationError('Last name must contain only letters and spaces');
  }

  if (data.age && !validateAge(data.age)) {
    throw new ValidationError('Age must be between 16 and 50');
  }

  if (data.gender && !validateGender(data.gender)) {
    throw new ValidationError('Gender must be M, F, or O');
  }

  if (data.photoUrl && !validateUrl(data.photoUrl)) {
    throw new ValidationError('Photo URL must be a valid URL');
  }

  if (data.about && !validateAbout(data.about)) {
    throw new ValidationError('About section cannot exceed 500 characters');
  }

  if (data.skills && !validateSkills(data.skills)) {
    throw new ValidationError(
      'Skills must be an array of max 10 non-empty strings (max 50 chars each)'
    );
  }
};

export const validateMakeConnectionRequestData = (
  data: ConnectionRequests | undefined
): void => {
  if (!data) {
    throw new ValidationError('Request data is required');
  }

  const { toUserId, status } = data;

  if (!toUserId) {
    throw new ValidationError('Target user ID is required');
  }

  if (!validateObjectId(toUserId.toString())) {
    throw new ValidationError('Invalid target user ID format');
  }

  if (!status) {
    throw new ValidationError('Status is required');
  }

  if (!validateStatus(status)) {
    throw new ValidationError('Invalid status value');
  }
};

export const validateReviewConnectionRequestData = (
  data: ConnectionRequests | undefined
): void => {
  const { toUserId, status } = data || {};
  if (!toUserId || !status) {
    throw new ValidationError('All required fields must be provided', {
      required: ['toUserId', 'status'],
    });
  }
  if (!validateObjectId(toUserId.toString())) {
    throw new BadRequestError('Invalid user ID format');
  }
  if (!['accepted', 'rejected'].includes(status)) {
    throw new ValidationError('Status must be either "accepted" or "rejected"');
  }
};
