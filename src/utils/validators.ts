// utils/validators.ts
import validator from 'validator';
import mongoose from 'mongoose';
import { User } from '../types/user';
import { ValidationError } from './errors';

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePassword = (password: string): boolean => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

export const validateName = (name: string): boolean => {
  return validator.isAlpha(name, 'en-US', { ignore: " -'" });
};

export const validateObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const validateUrl = (url: string): boolean => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    require_tld: false,
    allow_underscores: true,
  });
};

export const validateAge = (age: number): boolean => {
  return validator.isInt(String(age), {
    min: 16,
    max: 50,
  });
};

export const validateGender = (gender: string): boolean => {
  return ['M', 'F', 'O'].includes(gender);
};

export const validateSkills = (skills: string[]): boolean => {
  if (!Array.isArray(skills)) {
    return false;
  }
  if (skills.length > 10) {
    return false;
  }

  return skills.every(
    skill =>
      typeof skill === 'string' && skill.trim().length > 0 && skill.length <= 50
  );
};

export const validateAbout = (about: string): boolean => {
  return about.length <= 500;
};

export const validatePagination = (page: number, limit: number): boolean => {
  return page >= 1 && limit >= 1 && limit <= 100;
};

// Schema validation functions
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

  // Required fields
  if (!firstName || !lastName || !emailId || !password) {
    throw new ValidationError('All required fields must be provided', {
      required: ['firstName', 'lastName', 'emailId', 'password'],
    });
  }

  // Validate individual fields
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

  // Validate individual fields if present
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
