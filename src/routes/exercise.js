const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * components:
 *   schemas:
 *     ExerciseRecord:
 *       type: object
 *       required:
 *         - exercise_text
 *         - intensity
 *         - exercise_date
 *         - user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: 운동 기록 ID
 *         exercise_text:
 *           type: string
 *           description: 운동 내용 텍스트
 *         intensity:
 *           type: string
 *           enum: [저강도, 중강도, 고강도]
 *           description: 운동 강도
 *         exercise_date:
 *           type: string
 *           format: date
 *           description: 운동 날짜 (YYYY-MM-DD)
 *         user_id:
 *           type: integer
 *           description: 사용자 ID
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 기록 생성 시간
 *         last_updated:
 *           type: string
 *           format: date-time
 *           description: 마지막 업데이트 시간
 */

/**
 * @swagger
 * /api/exercise:
 *   post:
 *     summary: 새 운동 기록 추가
 *     tags: [Exercise]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exercise_text
 *               - intensity
 *               - exercise_date
 *               - user_id
 *             properties:
 *               exercise_text:
 *                 type: string
 *                 description: 운동 내용 텍스트
 *               intensity:
 *                 type: string
 *                 enum: [저강도, 중강도, 고강도]
 *                 description: 운동 강도
 *               exercise_date:
 *                 type: string
 *                 format: date
 *                 description: 운동 날짜 (YYYY-MM-DD)
 *               user_id:
 *                 type: integer
 *                 description: 사용자 ID
 *     responses:
 *       201:
 *         description: 운동 기록이 성공적으로 추가됨
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/', async (req, res) => {
  try {
    const {
      exercise_text,
      intensity,
      exercise_date,
      user_id
    } = req.body;
    
    // 필수 필드 검증
    if (!exercise_text || !intensity || !exercise_date || !user_id) {
      return res.status(400).json({ message: '운동 내용, 운동 강도, 운동 날짜, 사용자 ID는 필수 항목입니다.' });
    }
    
    // 강도 값 검증
    const validIntensities = ['저강도', '중강도', '고강도'];
    if (!validIntensities.includes(intensity)) {
      return res.status(400).json({ 
        message: '유효하지 않은 운동 강도입니다. 저강도, 중강도, 고강도 중 하나를 선택해주세요.' 
      });
    }
    
    // 운동 기록 추가
    const [result] = await db.execute(`
      INSERT INTO exercise_records (
        exercise_text, intensity, exercise_date, user_id
      ) VALUES (?, ?, ?, ?)
    `, [
      exercise_text,
      intensity,
      exercise_date,
      user_id
    ]);
    
    res.status(201).json({
      id: result.insertId,
      message: '운동 기록이 성공적으로 추가되었습니다.',
      exercise_record: {
        id: result.insertId,
        exercise_text,
        intensity,
        exercise_date,
        user_id,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('운동 기록 추가 오류:', error);
    res.status(500).json({ error: '운동 기록을 추가하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/exercise/user/{userId}:
 *   get:
 *     summary: 특정 사용자의 운동 기록 조회
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자의 운동 기록 목록
 *       500:
 *         description: 서버 오류
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // 사용자의 운동 기록 조회
    const [records] = await db.execute(`
      SELECT * FROM exercise_records
      WHERE user_id = ?
      ORDER BY exercise_date DESC, created_at DESC
    `, [userId]);
    
    res.json(records);
  } catch (error) {
    console.error('운동 기록 조회 오류:', error);
    res.status(500).json({ error: '운동 기록을 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/exercise/{id}:
 *   get:
 *     summary: 특정 운동 기록 조회
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 운동 기록 ID
 *     responses:
 *       200:
 *         description: 운동 기록 상세 정보
 *       404:
 *         description: 운동 기록을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    
    // 운동 기록 조회
    const [records] = await db.execute('SELECT * FROM exercise_records WHERE id = ?', [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: '운동 기록을 찾을 수 없습니다.' });
    }
    
    res.json(records[0]);
  } catch (error) {
    console.error('운동 기록 조회 오류:', error);
    res.status(500).json({ error: '운동 기록을 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/exercise/{id}:
 *   put:
 *     summary: 운동 기록 수정
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 운동 기록 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exercise_text:
 *                 type: string
 *                 description: 운동 내용 텍스트
 *               intensity:
 *                 type: string
 *                 enum: [저강도, 중강도, 고강도]
 *                 description: 운동 강도
 *               exercise_date:
 *                 type: string
 *                 format: date
 *                 description: 운동 날짜
 *     responses:
 *       200:
 *         description: 운동 기록이 성공적으로 수정됨
 *       404:
 *         description: 운동 기록을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put('/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    const {
      exercise_text,
      intensity,
      exercise_date
    } = req.body;
    
    // 운동 기록 존재 여부 확인
    const [records] = await db.execute('SELECT * FROM exercise_records WHERE id = ?', [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: '운동 기록을 찾을 수 없습니다.' });
    }
    
    // 강도 값 검증
    if (intensity && !['저강도', '중강도', '고강도'].includes(intensity)) {
      return res.status(400).json({ 
        message: '유효하지 않은 운동 강도입니다. 저강도, 중강도, 고강도 중 하나를 선택해주세요.' 
      });
    }
    
    // 업데이트할 필드 구성
    const updateFields = [];
    const updateValues = [];
    
    if (exercise_text !== undefined) {
      updateFields.push('exercise_text = ?');
      updateValues.push(exercise_text);
    }
    
    if (intensity !== undefined) {
      updateFields.push('intensity = ?');
      updateValues.push(intensity);
    }
    
    if (exercise_date !== undefined) {
      updateFields.push('exercise_date = ?');
      updateValues.push(exercise_date);
    }
    
    // 업데이트할 필드가 없으면 종료
    if (updateFields.length === 0) {
      return res.status(400).json({ message: '업데이트할 필드가 없습니다.' });
    }
    
    // 운동 기록 업데이트
    updateValues.push(recordId);
    await db.execute(`
      UPDATE exercise_records
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);
    
    // 업데이트된 기록 조회
    const [updatedRecord] = await db.execute('SELECT * FROM exercise_records WHERE id = ?', [recordId]);
    
    res.json({
      message: '운동 기록이 성공적으로 수정되었습니다.',
      exercise_record: updatedRecord[0]
    });
  } catch (error) {
    console.error('운동 기록 수정 오류:', error);
    res.status(500).json({ error: '운동 기록을 수정하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/exercise/{id}:
 *   delete:
 *     summary: 운동 기록 삭제
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 운동 기록 ID
 *     responses:
 *       200:
 *         description: 운동 기록이 성공적으로 삭제됨
 *       404:
 *         description: 운동 기록을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    
    // 운동 기록 존재 여부 확인
    const [records] = await db.execute('SELECT * FROM exercise_records WHERE id = ?', [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: '운동 기록을 찾을 수 없습니다.' });
    }
    
    // 운동 기록 삭제
    await db.execute('DELETE FROM exercise_records WHERE id = ?', [recordId]);
    
    res.json({
      message: '운동 기록이 성공적으로 삭제되었습니다.',
      deleted_record: records[0]
    });
  } catch (error) {
    console.error('운동 기록 삭제 오류:', error);
    res.status(500).json({ error: '운동 기록을 삭제하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/exercise/stats/user/{userId}:
 *   get:
 *     summary: 특정 사용자의 운동 통계 조회
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자의 운동 통계
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/stats/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // 사용자 존재 여부 확인
    const [users] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 총 운동 기록 수
    const [totalRecords] = await db.execute(`
      SELECT COUNT(*) as total_records
      FROM exercise_records
      WHERE user_id = ?
    `, [userId]);
    
    // 강도별 운동 기록 수
    const [intensityStats] = await db.execute(`
      SELECT intensity, COUNT(*) as count
      FROM exercise_records
      WHERE user_id = ?
      GROUP BY intensity
      ORDER BY 
        CASE 
          WHEN intensity = '저강도' THEN 1
          WHEN intensity = '중강도' THEN 2
          WHEN intensity = '고강도' THEN 3
          ELSE 4
        END
    `, [userId]);
    
    // 월별 운동 통계
    const [monthlyStats] = await db.execute(`
      SELECT 
        DATE_FORMAT(exercise_date, '%Y-%m') as month,
        COUNT(*) as total_count,
        SUM(CASE WHEN intensity = '저강도' THEN 1 ELSE 0 END) as low_intensity,
        SUM(CASE WHEN intensity = '중강도' THEN 1 ELSE 0 END) as medium_intensity,
        SUM(CASE WHEN intensity = '고강도' THEN 1 ELSE 0 END) as high_intensity
      FROM exercise_records
      WHERE user_id = ?
      GROUP BY DATE_FORMAT(exercise_date, '%Y-%m')
      ORDER BY month DESC
    `, [userId]);
    
    res.json({
      total_records: totalRecords[0].total_records || 0,
      intensity_stats: intensityStats,
      monthly_stats: monthlyStats
    });
  } catch (error) {
    console.error('운동 통계 조회 오류:', error);
    res.status(500).json({ error: '운동 통계를 조회하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 