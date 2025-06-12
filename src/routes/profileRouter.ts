import { Router } from 'express';
import { view, update, resetPassword } from '../controllers/profileController';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  validatePasswordReset,
  validateUpdate,
} from '../middlewares/validationHandler';
import { userAuthentication } from '../middlewares/authenticationHandler';
const router = Router();

router.get('/view', userAuthentication, asyncHandler(view));
router.patch(
  '/update',
  userAuthentication,
  validateUpdate,
  asyncHandler(update)
);
router.post(
  '/reset-password',
  userAuthentication,
  validatePasswordReset,
  asyncHandler(resetPassword)
);

export default router;
