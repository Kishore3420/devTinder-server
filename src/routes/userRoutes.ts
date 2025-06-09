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
  getUserProfile,
} from '../controllers/userController';
import {
  validateSignup,
  validateLogin,
  validateUpdate,
  validateUserId,
  validateEmailQuery,
  validatePaginationQuery,
} from '../middlewares/validationHandler';

// import { validateUserProfile } from '../middlewares/userProfileValidation';
import { userAuthentication } from '../middlewares/authenticationHandler';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// GET /user/:userId - Get user by ID
router.get(
  '/user/:userId',
  userAuthentication,
  validateUserId,
  asyncHandler(getUserById)
);

// GET /user?emailId=email - Get user by email
router.get(
  '/user',
  userAuthentication,
  validateEmailQuery,
  asyncHandler(getUserByEmail)
);

// GET /feed - Get all users with pagination
router.get(
  '/feed',
  userAuthentication,
  validatePaginationQuery,
  asyncHandler(getAllUsers)
);

// POST /signup - Create new user
router.post('/signup', validateSignup, asyncHandler(signup));

//POST /login - Login user
router.post('/login', validateLogin, asyncHandler(login));
// PATCH /user/:userId - Update user by ID
router.patch(
  '/user/:userId',
  userAuthentication,
  validateUserId,
  validateUpdate,
  asyncHandler(updateUser)
);

// DELETE /user/:userId - Delete user by ID
router.delete(
  '/user/:userId',
  userAuthentication,
  validateUserId,
  asyncHandler(deleteUser)
);

//GET USER PROFILE
router.get('/profile', userAuthentication, asyncHandler(getUserProfile));

export default router;
