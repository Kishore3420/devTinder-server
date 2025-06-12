import { Router } from 'express';
import { signup, login, logout } from '../controllers/authController';
import {
  validateSignup,
  validateLogin,
} from '../middlewares/validationHandler';
import { asyncHandler } from '../middlewares/errorHandler';
import { userAuthentication } from '../middlewares/authenticationHandler';

const router = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - emailId
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name (letters and spaces only)
 *               lastName:
 *                 type: string
 *                 description: User's last name (letters and spaces only)
 *               emailId:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 description: Password (min 8 chars, must include uppercase, lowercase, number, and special char)
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
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/signup', validateSignup, asyncHandler(signup));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailId
 *               - password
 *             properties:
 *               emailId:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateLogin, asyncHandler(login));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
router.post('/logout', userAuthentication, asyncHandler(logout));

export default router;
