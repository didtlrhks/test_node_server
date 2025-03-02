const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
 *           format: email
 *           description: 사용자 이메일 주소 (고유값)
 *         password:
 *           type: string
 *           format: password
 *           description: 사용자 비밀번호
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 계정 생성 날짜
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 새 사용자 등록
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
 *                 example: "홍길동"
 *                 description: 사용자 이름
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: 사용자 이메일 (고유값)
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *                 description: 사용자 비밀번호
 *     responses:
 *       201:
 *         description: 사용자가 성공적으로 생성됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: "사용자가 성공적으로 생성되었습니다."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "이미 사용 중인 이메일입니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "사용자를 생성하는 중 오류가 발생했습니다."
 */
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 필수 필드 검증
    if (!username || !email || !password) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }
    
    // 이메일 중복 확인
    const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }
    
    // 사용자 추가
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    
    res.status(201).json({
      id: result.insertId,
      message: '사용자가 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('사용자 생성 오류:', error);
    res.status(500).json({ error: '사용자를 생성하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 