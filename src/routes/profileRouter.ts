import { Router } from 'express';
import { view, update, resetPassword } from '../controllers/profileController';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  validatePasswordReset,
  validateUpdate,
} from '../middlewares/validationHandler';
import { userAuthentication } from '../middlewares/authenticationHandler';

const router = Router();

/**
 * @swagger
 * /profile/view:
 *   get:
 *     tags: [Profile]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 emailId:
 *                   type: string
 *                 age:
 *                   type: number
 *                 gender:
 *                   type: string
 *                 photoUrl:
 *                   type: string
 *                 about:
 *                   type: string
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Not authenticated
 */
router.get('/view', userAuthentication, asyncHandler(view));

/**
 * @swagger
 * /profile/update:
 *   patch:
 *     tags: [Profile]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name (letters and spaces only)
 *               lastName:
 *                 type: string
 *                 description: User's last name (letters and spaces only)
 *               age:
 *                 type: number
 *                 minimum: 16
 *                 maximum: 50
 *               gender:
 *                 type: string
 *                 enum: [M, F, O]
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *               about:
 *                 type: string
 *                 maxLength: 500
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid input data
 */
router.patch(
  '/update',
  userAuthentication,
  validateUpdate,
  asyncHandler(update)
);

/**
 * @swagger
 * /profile/reset-password:
 *   post:
 *     tags: [Profile]
 *     summary: Reset user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: New password (min 8 chars, must include uppercase, lowercase, number, and special char)
 *     responses:
 *       200:
 *         description: Password reset successful
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid input data
 */
router.post(
  '/reset-password',
  userAuthentication,
  validatePasswordReset,
  asyncHandler(resetPassword)
);

export default router;
