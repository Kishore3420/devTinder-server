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

/**
 * @swagger
 * /requests/send/{status}/{toUserId}:
 *   post:
 *     tags: [Connection Requests]
 *     summary: Send a connection request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [like, superlike]
 *         description: Type of connection request
 *       - in: path
 *         name: toUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to send request to
 *     responses:
 *       200:
 *         description: Connection request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 fromUser:
 *                   type: string
 *                 toUser:
 *                   type: string
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 */
router.post(
  '/send/:status/:toUserId',
  userAuthentication,
  validateMakeConnectionRequest,
  asyncHandler(makeConnectionRequest)
);

/**
 * @swagger
 * /requests/review/{status}/{toUserId}:
 *   post:
 *     tags: [Connection Requests]
 *     summary: Review a connection request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [accept, reject]
 *         description: Action to take on the request
 *       - in: path
 *         name: toUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user who sent the request
 *     responses:
 *       200:
 *         description: Connection request reviewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 fromUser:
 *                   type: string
 *                 toUser:
 *                   type: string
 *                 status:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Request not found
 */
router.post(
  '/review/:status/:toUserId',
  userAuthentication,
  validateReviewConnectionRequest,
  asyncHandler(reviewConnectionRequest)
);

export default router;
