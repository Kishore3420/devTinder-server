import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import validator from 'validator';

import { User } from '../types/user';
import { config } from '../config/app.config';

const userSchema = new Schema<User>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minLength: [2, 'First name must be at least 2 characters long'],
      maxLength: [50, 'First name cannot exceed 50 characters'],
      validate: {
        validator: function (value: string): boolean {
          return validator.isAlpha(value);
        },
        message:
          'First name can only contain letters, and spaces and cannot be left empty',
      },
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
      maxLength: [50, 'Last name cannot exceed 50 characters'],
      validate: {
        validator: function (value: string): boolean {
          if (!value || value.trim() === '') {
            return true;
          }
          return validator.isAlpha(value);
        },
        message:
          'Last name can only contain letters, and spaces, or can be left empty',
      },
    },
    emailId: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string): boolean {
          return validator.isEmail(email);
        },
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      validate: {
        validator: function (password: string): boolean {
          return validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      },
      select: false,
    },
    age: {
      type: Number,
      min: [16, 'Age must be at least 16'],
      max: [50, 'Age cannot exceed 50'],
      default: 18,
      validate: {
        validator: function (value: number): boolean {
          return Number.isInteger(value);
        },
        message: 'Age must be a whole number',
      },
    },
    gender: {
      type: String,
      enum: {
        values: ['M', 'F', 'O'],
        message: 'Gender must be M (Male), F (Female), or O (Other)',
      },
      default: 'M',
      uppercase: true,
    },
    photoUrl: {
      type: String,
      trim: true,
      default: 'https://freesvg.org/img/abstract-user-flat-4.png',
      validate: {
        validator: function (value: string): boolean {
          if (!value || value.trim() === '') {
            return true;
          }
          return validator.isURL(value, {
            protocols: ['http', 'https'],
            require_protocol: true,
            require_valid_protocol: true,
          });
        },
        message: 'Photo URL must be a valid HTTP or HTTPS URL',
      },
    },
    about: {
      type: String,
      trim: true,
      default: '',
      maxLength: [500, 'About section cannot exceed 500 characters'],
      validate: {
        validator: function (value: string): boolean {
          if (!value) {
            return true;
          }
          return !/<script|javascript:|on\w+=/i.test(value);
        },
        message: 'About section contains invalid content',
      },
    },
    skills: {
      type: [String],
      default: [],
      validate: [
        {
          validator: function (skills: string[]): boolean {
            return skills.length <= 10;
          },
          message: 'Cannot have more than 10 skills',
        },
        {
          validator: function (skills: string[]): boolean {
            return skills.every(skill => {
              if (typeof skill !== 'string') {
                return false;
              }
              const trimmed = skill.trim();
              return trimmed.length > 0 && trimmed.length <= 50;
            });
          },
          message:
            'Each skill must be a non-empty string with maximum 50 characters',
        },
        {
          validator: function (skills: string[]): boolean {
            const lowerCaseSkills = skills.map(skill =>
              skill.toLowerCase().trim()
            );
            return lowerCaseSkills.length === new Set(lowerCaseSkills).size;
          },
          message: 'Skills cannot contain duplicates',
        },
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ createdAt: -1 });
userSchema.index({ firstName: 1, lastName: 1 });

userSchema.pre('save', function (next) {
  if (this.skills && this.skills.length > 0) {
    this.skills = this.skills
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
    const uniqueSkills = [];
    const seenSkills = new Set();
    for (const skill of this.skills) {
      const lowerSkill = skill.toLowerCase();
      if (!seenSkills.has(lowerSkill)) {
        seenSkills.add(lowerSkill);
        uniqueSkills.push(skill);
      }
    }
    this.skills = uniqueSkills;
  }
  next();
});

userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as { $set?: { skills?: string[] } };

  if (update.$set && update.$set.skills) {
    const skills = update.$set.skills;
    if (Array.isArray(skills)) {
      const cleanedSkills = skills
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      const uniqueSkills = [];
      const seenSkills = new Set();
      for (const skill of cleanedSkills) {
        const lowerSkill = skill.toLowerCase();
        if (!seenSkills.has(lowerSkill)) {
          seenSkills.add(lowerSkill);
          uniqueSkills.push(skill);
        }
      }
      update.$set.skills = uniqueSkills;
    }
  }

  next();
});

userSchema.methods.getPublicProfile = function (): User {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.verifyPassword = async function (
  passwordInputByUser: string
): Promise<boolean> {
  const actualPassword = this.password;
  return await bcrypt.compare(passwordInputByUser, actualPassword);
};
userSchema.methods.getJWT = async function (): Promise<string> {
  return jwt.sign({ userId: this._id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions);
};

userSchema.statics.findBySkill = function (skill: string): Promise<User[]> {
  return this.find({ skills: { $regex: new RegExp(skill, 'i') } }).select(
    '-password'
  );
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.set('toJSON', { virtuals: true });

export const UserModel = model<User>('User', userSchema);
