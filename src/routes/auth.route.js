const express = require('express');
const router = express.Router();
const authController = require('../modules/auth/auth.controller');
const { validate, schemas } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoint untuk autentikasi
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Kredensial tidak valid
 */
router.post('/login', validate(schemas.login), asyncHandler((req, res) => authController.login(req, res)));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token diperbarui
 *       401:
 *         description: Refresh token tidak valid
 */
router.post('/refresh', validate(schemas.refreshToken), asyncHandler((req, res) => authController.refreshToken(req, res)));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
router.post('/logout', authenticateToken, asyncHandler((req, res) => authController.logout(req, res)));

module.exports = router;
