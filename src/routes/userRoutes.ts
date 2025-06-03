// routes/userRoutes.ts
import { Router } from 'express';
import {
  signup,
  login,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import {
  validateSignup,
  validateLogin,
  validateUpdate,
  validateUserId,
  validateEmailQuery,
  validatePaginationQuery,
} from '../middlewares/validation';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// GET /user/:userId - Get user by ID
router.get('/user/:userId', validateUserId, asyncHandler(getUserById));

// GET /user?emailId=email - Get user by email
router.get('/user', validateEmailQuery, asyncHandler(getUserByEmail));

// GET /feed - Get all users with pagination
router.get('/feed', validatePaginationQuery, asyncHandler(getAllUsers));

// POST /signup - Create new user
router.post('/signup', validateSignup, asyncHandler(signup));

//POST /login - Login user
router.post('/login', validateLogin, asyncHandler(login));
// PATCH /user/:userId - Update user by ID
router.patch(
  '/user/:userId',
  validateUserId,
  validateUpdate,
  asyncHandler(updateUser)
);

// DELETE /user/:userId - Delete user by ID
router.delete('/user/:userId', validateUserId, asyncHandler(deleteUser));

export default router;
