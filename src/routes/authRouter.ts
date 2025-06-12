import { Router } from 'express';
import { signup, login, logout } from '../controllers/authController';
import {
  validateSignup,
  validateLogin,
} from '../middlewares/validationHandler';
import { asyncHandler } from '../middlewares/errorHandler';
import { userAuthentication } from '../middlewares/authenticationHandler';

const router = Router();

router.post('/signup', validateSignup, asyncHandler(signup));
router.post('/login', validateLogin, asyncHandler(login));
router.post('/logout', userAuthentication, asyncHandler(logout));

export default router;
