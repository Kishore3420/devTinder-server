import express, { Request, Response } from 'express';
import { connectDB } from './config/database';
import { User } from './types/user';
import { UserModel } from './models/user';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to handle validation errors
const handleValidationError = (
  error: any
): { message: string; details?: Record<string, string> } => {
  if (error.name === 'ValidationError') {
    const errors: Record<string, string> = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
    return {
      message: 'Validation failed',
      details: errors,
    };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      message: `${field} already exists`,
    };
  }

  return { message: 'Internal server error' };
};

// Input validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

const validateName = (name: string): boolean => {
  // Only letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
};

const validateObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// POST signup route
app.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
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

    // Required field validation
    if (!firstName || !lastName || !emailId || !password) {
      res.status(400).json({
        message: 'All required fields must be provided',
        required: ['firstName', 'lastName', 'emailId', 'password'],
      });
      return;
    }

    // Additional input validation
    if (!validateName(firstName)) {
      res.status(400).json({
        message:
          'First name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes',
      });
      return;
    }

    if (lastName && !validateName(lastName)) {
      res.status(400).json({
        message:
          'Last name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes',
      });
      return;
    }

    if (!validateEmail(emailId)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    if (!validatePassword(password)) {
      res.status(400).json({
        message:
          'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)',
      });
      return;
    }

    if (age && (age < 16 || age > 50)) {
      res.status(400).json({ message: 'Age must be between 16 and 50' });
      return;
    }

    if (gender && !['M', 'F', 'O'].includes(gender)) {
      res.status(400).json({ message: 'Gender must be M, F, or O' });
      return;
    }

    if (photoUrl && photoUrl.trim()) {
      try {
        new URL(photoUrl);
      } catch {
        res.status(400).json({ message: 'Photo URL must be a valid URL' });
        return;
      }
    }

    if (about && about.length > 500) {
      res
        .status(400)
        .json({ message: 'About section cannot exceed 500 characters' });
      return;
    }

    if (skills && Array.isArray(skills)) {
      if (skills.length > 10) {
        res.status(400).json({ message: 'Cannot have more than 10 skills' });
        return;
      }
      for (const skill of skills) {
        if (
          typeof skill !== 'string' ||
          skill.trim().length === 0 ||
          skill.length > 50
        ) {
          res.status(400).json({
            message:
              'Each skill must be a non-empty string with max 50 characters',
          });
          return;
        }
      }
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      emailId: emailId.toLowerCase(),
    });
    if (existingUser) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
    const userResponse = savedUser.toObject();
    delete (userResponse as { password?: string }).password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    const errorResponse = handleValidationError(error);
    const statusCode =
      error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
    res.status(statusCode).json(errorResponse);
  }
});

// GET user by email
app.get('/user', async (req: Request, res: Response): Promise<void> => {
  try {
    const emailId = req.query.emailId as string;

    if (!emailId) {
      res.status(400).json({ message: 'Email query parameter is required' });
      return;
    }

    if (!validateEmail(emailId)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    const user = await UserModel.findOne({
      emailId: emailId.toLowerCase(),
    }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET user by ID
app.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    if (!validateObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }

    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET all users with pagination
app.get('/feed', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({
        message:
          'Invalid pagination parameters. Page must be >= 1, limit must be 1-100',
      });
      return;
    }

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
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH update user by id
app.patch(
  '/user/:userId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;
      const userId = req.params.userId;

      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      if (!validateObjectId(userId)) {
        res.status(400).json({ message: 'Invalid user ID format' });
        return;
      }

      if (!data || Object.keys(data).length === 0) {
        res.status(400).json({ message: 'No update data provided' });
        return;
      }

      const allowedFields: (keyof User)[] = [
        'firstName',
        'lastName',
        'age',
        'gender',
        'photoUrl',
        'about',
        'skills',
      ];

      const updateKeys = Object.keys(data);
      const isValidUpdate = updateKeys.every(key =>
        allowedFields.includes(key as keyof User)
      );

      if (!isValidUpdate) {
        const invalidFields = updateKeys.filter(
          key => !allowedFields.includes(key as keyof User)
        );
        res.status(400).json({
          message: 'Invalid fields for update',
          invalidFields,
          allowedFields,
        });
        return;
      }

      // Validate individual fields
      if (data.firstName && !validateName(data.firstName)) {
        res.status(400).json({
          message:
            'First name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes',
        });
        return;
      }

      if (data.lastName && !validateName(data.lastName)) {
        res.status(400).json({
          message:
            'Last name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes',
        });
        return;
      }

      if (data.age && (data.age < 16 || data.age > 50)) {
        res.status(400).json({ message: 'Age must be between 16 and 50' });
        return;
      }

      if (data.gender && !['M', 'F', 'O'].includes(data.gender)) {
        res.status(400).json({ message: 'Gender must be M, F, or O' });
        return;
      }

      if (data.photoUrl) {
        try {
          new URL(data.photoUrl);
        } catch {
          res.status(400).json({ message: 'Photo URL must be a valid URL' });
          return;
        }
      }

      if (data.about && data.about.length > 500) {
        res
          .status(400)
          .json({ message: 'About section cannot exceed 500 characters' });
        return;
      }

      if (data.skills) {
        if (!Array.isArray(data.skills)) {
          res.status(400).json({ message: 'Skills must be an array' });
          return;
        }
        if (data.skills.length > 10) {
          res.status(400).json({ message: 'Cannot have more than 10 skills' });
          return;
        }
        for (const skill of data.skills) {
          if (
            typeof skill !== 'string' ||
            skill.trim().length === 0 ||
            skill.length > 50
          ) {
            res.status(400).json({
              message:
                'Each skill must be a non-empty string with max 50 characters',
            });
            return;
          }
        }
      }

      // Trim string fields
      const sanitizedData = { ...data };
      if (sanitizedData.firstName) {
        sanitizedData.firstName = sanitizedData.firstName.trim();
      }
      if (sanitizedData.lastName) {
        sanitizedData.lastName = sanitizedData.lastName.trim();
      }
      if (sanitizedData.photoUrl) {
        sanitizedData.photoUrl = sanitizedData.photoUrl.trim();
      }
      if (sanitizedData.about) {
        sanitizedData.about = sanitizedData.about.trim();
      }
      if (sanitizedData.skills) {
        sanitizedData.skills = sanitizedData.skills.map((skill: string) =>
          skill.trim()
        );
      }

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: sanitizedData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'User updated successfully', user });
    } catch (error: any) {
      console.error('Update user error:', error);
      const errorResponse = handleValidationError(error);
      const statusCode =
        error instanceof Error && error.name === 'ValidationError' ? 400 : 500;
      res.status(statusCode).json(errorResponse);
    }
  }
);

// DELETE user by ID
app.delete(
  '/user/:userId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      if (!validateObjectId(userId)) {
        res.status(400).json({ message: 'Invalid user ID format' });
        return;
      }

      const user = await UserModel.findByIdAndDelete(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Connect to the database
connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app;
