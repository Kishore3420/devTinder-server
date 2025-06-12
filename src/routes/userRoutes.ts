import { Router } from 'express';
import {
  getUserRequests,
  getUserConnections,
  getAllUsers,
} from '../controllers/userController';

import { userAuthentication } from '../middlewares/authenticationHandler';
import { asyncHandler } from '../middlewares/errorHandler';
import { validatePaginationQuery } from '../middlewares/validationHandler';

const router = Router();

router.get(
  '/requests/received',
  userAuthentication,
  asyncHandler(getUserRequests)
);

router.get(
  '/requests/connections',
  userAuthentication,
  asyncHandler(getUserConnections)
);

router.get(
  '/feed',
  userAuthentication,
  validatePaginationQuery,
  asyncHandler(getAllUsers)
);

export default router;
