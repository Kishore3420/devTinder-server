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

/**
 * @swagger
 * /user/requests/received:
 *   get:
 *     tags: [User]
 *     summary: Get received connection requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received connection requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   fromUser:
 *                     type: object
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/requests/received',
  userAuthentication,
  asyncHandler(getUserRequests)
);

/**
 * @swagger
 * /user/requests/connections:
 *   get:
 *     tags: [User]
 *     summary: Get user connections
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user connections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   user:
 *                     type: object
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/requests/connections',
  userAuthentication,
  asyncHandler(getUserConnections)
);

/**
 * @swagger
 * /user/feed:
 *   get:
 *     tags: [User]
 *     summary: Get user feed with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid pagination parameters
 */
router.get(
  '/feed',
  userAuthentication,
  validatePaginationQuery,
  asyncHandler(getAllUsers)
);

export default router;
