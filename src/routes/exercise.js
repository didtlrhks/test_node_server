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
 * /api/exercise/{id}/user/{userId}:
 *   delete:
 *     summary: 특정 사용자의 특정 운동 기록 삭제
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 운동 기록 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 운동 기록이 성공적으로 삭제됨
 *       403:
 *         description: 권한 없음 (다른 사용자의 운동 기록)
 *       404:
 *         description: 운동 기록을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id/user/:userId', async (req, res) => {
  try {
    const recordId = req.params.id;
    const userId = req.params.userId;
    
    // 운동 기록 존재 여부 및 사용자 소유권 확인
    const [records] = await db.execute(
      'SELECT * FROM exercise_records WHERE id = ? AND user_id = ?', 
      [recordId, userId]
    );
    
    if (records.length === 0) {
      // 기록이 존재하는지 먼저 확인
      const [recordExists] = await db.execute('SELECT * FROM exercise_records WHERE id = ?', [recordId]);
      
      if (recordExists.length === 0) {
        return res.status(404).json({ message: '운동 기록을 찾을 수 없습니다.' });
      } else {
        // 기록은 존재하지만 사용자 ID가 일치하지 않음
        return res.status(403).json({ message: '이 운동 기록을 삭제할 권한이 없습니다.' });
      }
    }
    
    // 운동 기록 삭제
    await db.execute('DELETE FROM exercise_records WHERE id = ? AND user_id = ?', [recordId, userId]);
    
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
 * /api/exercise/batch-delete/user/{userId}:
 *   post:
 *     summary: 특정 사용자의 여러 운동 기록 한 번에 삭제
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 삭제할 운동 기록 ID 배열
 *     responses:
 *       200:
 *         description: 운동 기록이 성공적으로 삭제됨
 *       400:
 *         description: 잘못된 요청
 *       403:
 *         description: 권한 없음 (다른 사용자의 운동 기록 포함)
 *       500:
 *         description: 서버 오류
 */
router.post('/batch-delete/user/:userId', async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.params.userId;
    
    // 필수 필드 검증
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: '삭제할 운동 기록 ID 배열이 필요합니다.' });
    }
    
    // 모든 기록이 해당 사용자의 것인지 확인
    const placeholders = ids.map(() => '?').join(',');
    const [userRecords] = await db.execute(`
      SELECT id FROM exercise_records 
      WHERE id IN (${placeholders}) AND user_id = ?
    `, [...ids, userId]);
    
    // 사용자의 기록 ID만 추출
    const userRecordIds = userRecords.map(record => record.id);
    
    // 요청된 ID와 사용자의 기록 ID 비교
    const unauthorizedIds = ids.filter(id => !userRecordIds.includes(parseInt(id)));
    
    if (unauthorizedIds.length > 0) {
      return res.status(403).json({ 
        message: '일부 운동 기록을 삭제할 권한이 없습니다.',
        unauthorized_ids: unauthorizedIds
      });
    }
    
    // 삭제할 기록 조회 (삭제 전 정보 저장)
    const [recordsToDelete] = await db.execute(`
      SELECT * FROM exercise_records 
      WHERE id IN (${placeholders}) AND user_id = ?
    `, [...ids, userId]);
    
    // 운동 기록 삭제
    const [result] = await db.execute(`
      DELETE FROM exercise_records 
      WHERE id IN (${placeholders}) AND user_id = ?
    `, [...ids, userId]);
    
    res.json({
      message: `${result.affectedRows}개의 운동 기록이 성공적으로 삭제되었습니다.`,
      deleted_count: result.affectedRows,
      deleted_records: recordsToDelete
    });
  } catch (error) {
    console.error('운동 기록 일괄 삭제 오류:', error);
    res.status(500).json({ error: '운동 기록을 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 