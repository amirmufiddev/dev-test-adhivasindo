const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../../middlewares/validation');
const { authenticateToken } = require('../../middlewares/authMiddleware');
const asyncHandler = require('../../utils/asyncHandler');
const { successResponse } = require('../../utils/response');

// Service
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } = require('../../config/jwt');
const db = require('../../config/database');

// Repository
class AuthRepository {
  constructor() {
    this.tableName = 'refresh_tokens';
    this.db = db;
  }

  async saveRefreshToken({ user_id, token, expires_at }) {
    const [row] = await this.db(this.tableName)
      .insert({ user_id, token, expires_at })
      .returning('*');
    return row;
  }

  async findRefreshToken(token) {
    return this.db(this.tableName)
      .where({ token })
      .where('expires_at', '>', new Date())
      .first();
  }

  async deleteRefreshToken(token) {
    return this.db(this.tableName).where({ token }).del();
  }

  async findUserByUsername(username) {
    return db('users').where({ username }).first();
  }
}

const authRepository = new AuthRepository();

// Service
class AuthService {
  generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  }

  async login(username, password) {
    const user = await authRepository.findUserByUsername(username);
    if (!user) {
      const err = new Error('Username atau password salah');
      err.statusCode = 401;
      throw err;
    }

    if (!user.is_active) {
      const err = new Error('Akun tidak aktif');
      err.statusCode = 403;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const err = new Error('Username atau password salah');
      err.statusCode = 401;
      throw err;
    }

    const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.saveRefreshToken({ user_id: user.id, token: refreshToken, expires_at: expiresAt });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name, role: user.role },
    };
  }

  async refreshToken(refreshToken) {
    let decoded;
    try {
      decoded = this.verifyRefreshToken(refreshToken);
    } catch (err) {
      const error = new Error('Refresh token tidak valid atau expired');
      error.statusCode = 401;
      throw error;
    }

    const tokenRecord = await authRepository.findRefreshToken(refreshToken);
    if (!tokenRecord) {
      const err = new Error('Refresh token tidak ditemukan atau sudah expired');
      err.statusCode = 401;
      throw err;
    }

    const payload = { id: decoded.id, username: decoded.username, email: decoded.email, role: decoded.role };
    const accessToken = this.generateAccessToken(payload);

    return { accessToken };
  }

  async logout(refreshToken) {
    await authRepository.deleteRefreshToken(refreshToken);
    return true;
  }
}

const authService = new AuthService();

// Controller
class AuthController {
  async login(req, res) {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    return successResponse(res, result, 'Login berhasil');
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    return successResponse(res, result, 'Token diperbarui');
  }

  async logout(req, res) {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return successResponse(res, null, 'Logout berhasil');
  }
}

const authController = new AuthController();

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
