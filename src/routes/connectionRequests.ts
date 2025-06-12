import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  makeConnectionRequest,
  reviewConnectionRequest,
} from '../controllers/connectionRequestsController';
import { userAuthentication } from '../middlewares/authenticationHandler';
import {
  validateMakeConnectionRequest,
  validateReviewConnectionRequest,
} from '../middlewares/validationHandler';

const router = Router();

router.post(
  '/send/:status/:toUserId',
  userAuthentication,
  validateMakeConnectionRequest,
  asyncHandler(makeConnectionRequest)
);
router.post(
  '/review/:status/:toUserId',
  userAuthentication,
  validateReviewConnectionRequest,
  asyncHandler(reviewConnectionRequest)
);

export default router;
