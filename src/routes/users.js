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
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 환자 ID를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { username, email, password, patient_id } = req.body;
    
    // 필수 필드 검증
    if (!username || !email || !password) {
      return res.status(400).json({ message: '사용자 이름, 이메일, 비밀번호는 필수 항목입니다.' });
    }
    
    // 이메일 중복 확인
    const [existingUser] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }
    
    let emrData = null;
    
    // patient_id가 제공된 경우 EMR 데이터 확인
    if (patient_id) {
      const [patients] = await connection.execute(
        'SELECT * FROM emr_data WHERE patient_id = ?',
        [patient_id]
      );
      
      if (patients.length === 0) {
        return res.status(404).json({ message: '해당 환자 ID를 찾을 수 없습니다.' });
      }
      
      // 이미 다른 사용자와 연결된 patient_id인지 확인
      const [linkedUsers] = await connection.execute(
        'SELECT * FROM users WHERE patient_id = ?',
        [patient_id]
      );
      
      if (linkedUsers.length > 0) {
        return res.status(400).json({ message: '이 환자 ID는 이미 다른 사용자와 연결되어 있습니다.' });
      }
      
      emrData = patients[0];
    }
    
    // 트랜잭션 시작
    await connection.beginTransaction();
    
    try {
      // 사용자 추가 (EMR 데이터가 있는 경우 모든 필드 포함)
      let insertQuery;
      let insertParams;
      
      if (emrData) {
        insertQuery = `
          INSERT INTO users (
            username, email, password, patient_id,
            patient_name, phone, birth_date, gender,
            ast, alt, ggt, medical_record, prescription_record,
            waist_circumference, bmi, glucose, hba1c,
            triglyceride, ldl, hdl, uric_acid,
            sbp, dbp, gfr, plt
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `;
        
        insertParams = [
          username, email, password, patient_id,
          emrData.patient_name, emrData.phone, emrData.birth_date, emrData.gender,
          emrData.ast, emrData.alt, emrData.ggt, emrData.medical_record, emrData.prescription_record,
          emrData.waist_circumference, emrData.bmi, emrData.glucose, emrData.hba1c,
          emrData.triglyceride, emrData.ldl, emrData.hdl, emrData.uric_acid,
          emrData.sbp, emrData.dbp, emrData.gfr, emrData.plt
        ];
      } else {
        insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        insertParams = [username, email, password];
      }
      
      const [result] = await connection.execute(insertQuery, insertParams);
      
      // EMR 데이터가 있는 경우 사용자와 연결
      if (emrData) {
        // EMR 데이터 업데이트 (필요한 경우)
        await connection.execute(
          `UPDATE emr_data 
           SET email = ?, 
               last_updated = CURRENT_TIMESTAMP 
           WHERE patient_id = ?`,
          [email, patient_id]
        );
      }
      
      // 트랜잭션 커밋
      await connection.commit();
      
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
      // 오류 발생 시 롤백
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('사용자 생성 오류:', error);
    res.status(500).json({ error: '사용자를 생성하는 중 오류가 발생했습니다.' });
  } finally {
    // 연결 해제
    connection.release();
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
    const [users] = await db.execute(`
      SELECT u.id, u.username, u.email, u.patient_id, u.created_at,
             e.patient_name, e.phone, e.birth_date, e.gender
      FROM users u
      LEFT JOIN emr_data e ON u.patient_id = e.patient_id
      ORDER BY u.id ASC
    `);
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
    
    // 사용자 정보와 EMR 데이터 함께 조회
    const [users] = await db.execute(`
      SELECT u.id, u.username, u.email, u.patient_id, u.created_at,
             e.*
      FROM users u
      LEFT JOIN emr_data e ON u.patient_id = e.patient_id
      WHERE u.id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    const user = users[0];
    const response = {
      id: user.id,
      username: user.username,
      email: user.email,
      patient_id: user.patient_id,
      created_at: user.created_at
    };
    
    // EMR 데이터가 있으면 포함
    if (user.patient_id) {
      response.emr_data = {
        patient_name: user.patient_name,
        patient_id: user.patient_id,
        email: user.email,
        phone: user.phone,
        birth_date: user.birth_date,
        gender: user.gender,
        ast: user.ast,
        alt: user.alt,
        ggt: user.ggt,
        medical_record: user.medical_record,
        prescription_record: user.prescription_record,
        waist_circumference: user.waist_circumference,
        bmi: user.bmi,
        glucose: user.glucose,
        hba1c: user.hba1c,
        triglyceride: user.triglyceride,
        ldl: user.ldl,
        hdl: user.hdl,
        uric_acid: user.uric_acid,
        sbp: user.sbp,
        dbp: user.dbp,
        gfr: user.gfr,
        plt: user.plt,
        created_at: user.created_at,
        last_updated: user.last_updated
      };
    }
    
    res.json(response);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ error: '사용자를 조회하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 