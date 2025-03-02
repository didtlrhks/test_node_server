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
 *         patient_id:
 *           type: string
 *           description: 연결된 환자 ID (선택 사항)
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
 *               patient_id:
 *                 type: string
 *                 example: "P12345"
 *                 description: 연결할 환자 ID
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
 *                 emr_data:
 *                   type: object
 *                   description: 연결된 EMR 데이터
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 환자 ID를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post('/', async (req, res) => {
  try {
    const { username, email, password, patient_id } = req.body;
    
    // 필수 필드 검증
    if (!username || !email || !password) {
      return res.status(400).json({ message: '사용자 이름, 이메일, 비밀번호는 필수 항목입니다.' });
    }
    
    // 이메일 중복 확인
    const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }
    
    let emrData = null;
    
    // patient_id가 제공된 경우 EMR 데이터 확인
    if (patient_id) {
      const [patients] = await db.execute(
        'SELECT * FROM emr_data WHERE patient_id = ?',
        [patient_id]
      );
      
      if (patients.length === 0) {
        return res.status(404).json({ message: '해당 환자 ID를 찾을 수 없습니다.' });
      }
      
      // 이미 다른 사용자와 연결된 patient_id인지 확인
      const [linkedUsers] = await db.execute(
        'SELECT * FROM users WHERE patient_id = ?',
        [patient_id]
      );
      
      if (linkedUsers.length > 0) {
        return res.status(400).json({ message: '이 환자 ID는 이미 다른 사용자와 연결되어 있습니다.' });
      }
      
      emrData = patients[0];
    }
    
    // 사용자 추가
    const insertQuery = patient_id 
      ? 'INSERT INTO users (username, email, password, patient_id) VALUES (?, ?, ?, ?)'
      : 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    
    const insertParams = patient_id 
      ? [username, email, password, patient_id]
      : [username, email, password];
    
    const [result] = await db.execute(insertQuery, insertParams);
    
    const response = {
      id: result.insertId,
      username,
      email,
      message: '사용자가 성공적으로 생성되었습니다.'
    };
    
    // EMR 데이터가 있으면 응답에 포함
    if (emrData) {
      response.patient_id = patient_id;
      response.emr_data = emrData;
    }
    
    res.status(201).json(response);
  } catch (error) {
    console.error('사용자 생성 오류:', error);
    res.status(500).json({ error: '사용자를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 모든 사용자 조회
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 사용자 목록
 *       500:
 *         description: 서버 오류
 */
router.get('/', async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, username, email, patient_id, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ error: '사용자를 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 특정 사용자 조회
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 정보와 연결된 EMR 데이터
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 사용자 정보 조회
    const [users] = await db.execute(
      'SELECT id, username, email, patient_id, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    const user = users[0];
    const response = { ...user };
    
    // 연결된 EMR 데이터가 있으면 조회
    if (user.patient_id) {
      const [emrData] = await db.execute(
        'SELECT * FROM emr_data WHERE patient_id = ?',
        [user.patient_id]
      );
      
      if (emrData.length > 0) {
        response.emr_data = emrData[0];
      }
    }
    
    res.json(response);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ error: '사용자를 조회하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 