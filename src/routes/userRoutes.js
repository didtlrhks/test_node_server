const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: 사용자 ID
 *         username:
 *           type: string
 *           description: 사용자 이름
 *         email:
 *           type: string
 *           description: 사용자 이메일
 *         password:
 *           type: string
 *           description: 사용자 비밀번호
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 생성 날짜
 *       example:
 *         id: 1
 *         username: 홍길동
 *         email: hong@example.com
 *         password: password123
 *         created_at: 2023-01-01T00:00:00Z
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리 API
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 모든 사용자 조회
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 특정 사용자 조회
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 새 사용자 생성
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 사용자 생성 성공
 *       500:
 *         description: 서버 오류
 */
router.post('/', userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: 사용자 정보 업데이트
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 사용자 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 사용자 정보 업데이트 성공
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: 사용자 삭제
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 삭제 성공
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id', userController.deleteUser);

module.exports = router; 