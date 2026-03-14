const express = require('express');
const router = express.Router();
const userController = require('../modules/users/users.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');
const { validate, schemas } = require('../middlewares/validation');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoint untuk manajemen user (CRUD)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Mendapatkan semua user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', authenticateToken, requireAdmin, validate(schemas.paginationQuery, 'query'), asyncHandler((req, res) => userController.getAllUsers(req, res)));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Mendapatkan user berdasarkan ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User ditemukan
 *       404:
 *         description: User tidak ditemukan
 */
router.get('/:id', authenticateToken, asyncHandler((req, res) => userController.getUserById(req, res)));

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Membuat user baru (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - full_name
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               full_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       409:
 *         description: Username atau email sudah digunakan
 */
router.post('/', authenticateToken, requireAdmin, validate(schemas.createUser), asyncHandler((req, res) => userController.createUser(req, res)));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mengupdate user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               full_name:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User berhasil diupdate
 *       404:
 *         description: User tidak ditemukan
 */
router.put('/:id', authenticateToken, validate(schemas.updateUser), asyncHandler((req, res) => userController.updateUser(req, res)));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Menghapus user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 */
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler((req, res) => userController.deleteUser(req, res)));

module.exports = router;
