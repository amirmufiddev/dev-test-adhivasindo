const express = require('express');
const router = express.Router();
const searchController = require('../modules/search/search.controller');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validate, schemas } = require('../middlewares/validation');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Endpoint untuk pencarian data dari external API
 */

/**
 * @swagger
 * /api/data-search:
 *   get:
 *     summary: Pencarian data dari external API (by NAMA, NIM, YMD)
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter berdasarkan nama (partial match)
 *         example: Turner Mia
 *       - in: query
 *         name: nim
 *         schema:
 *           type: string
 *         description: Filter berdasarkan NIM (exact match)
 *         example: "9352078461"
 *       - in: query
 *         name: ymd
 *         schema:
 *           type: string
 *         description: Filter berdasarkan tanggal format YYYYMMDD (exact match)
 *         example: "20230405"
 *     responses:
 *       200:
 *         description: Data berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ymd:
 *                         type: string
 *                       nama:
 *                         type: string
 *                       nim:
 *                         type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       502:
 *         description: External API error
 */
router.get('/', authenticateToken, validate(schemas.searchQuery, 'query'), asyncHandler((req, res) => searchController.search(req, res)));

module.exports = router;
