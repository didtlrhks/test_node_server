const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * /api/archive:
 *   post:
 *     summary: 하루 데이터 아카이브
 *     tags: [Archive]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - archiveDate
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: 사용자 ID
 *               archiveDate:
 *                 type: string
 *                 format: date
 *                 description: 아카이브할 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 아카이브 성공
 */
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { userId, archiveDate } = req.body;
    
    // 데이터 조회 함수
    const getRecords = async (table, dateField) => {
      const [records] = await connection.execute(
        `SELECT * FROM ${table} WHERE user_id = ? AND DATE(${dateField}) = ?`,
        [userId, archiveDate]
      );
      return records || [];
    };

    // 각 테이블의 데이터 조회
    const breakfasts = await getRecords('breakfast_records', 'breakfast_date');
    const lunches = await getRecords('lunch_records', 'lunch_date');
    const dinners = await getRecords('dinner_records', 'dinner_date');
    const snacks = await getRecords('snack_records', 'snack_date');
    const exercises = await getRecords('exercise_records', 'exercise_date');
    const weights = await getRecords('weight_records', 'weight_date');
    const dailyReviews = await getRecords('daily_reviews', 'review_date');

    // 데이터 저장 전 안전한 JSON 문자열 생성
    const safeStringify = (data) => {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        return '[]';
      }
      return JSON.stringify(data);
    };

    // 아카이브 데이터 저장
    await connection.execute(`
      REPLACE INTO daily_archives (
        archive_date, user_id, 
        breakfast_data, lunch_data, dinner_data, 
        snack_data, exercise_data, weight_data, 
        daily_review_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      archiveDate,
      userId,
      safeStringify(breakfasts),
      safeStringify(lunches),
      safeStringify(dinners),
      safeStringify(snacks),
      safeStringify(exercises),
      safeStringify(weights),
      safeStringify(dailyReviews)
    ]);
    
    await connection.commit();
    
    res.json({ 
      message: '아카이브 완료',
      archivedDate: archiveDate,
      archivedCounts: {
        breakfasts: breakfasts.length,
        lunches: lunches.length,
        dinners: dinners.length,
        snacks: snacks.length,
        exercises: exercises.length,
        weights: weights.length,
        dailyReviews: dailyReviews.length
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('아카이브 오류:', error);
    res.status(500).json({ error: '아카이브 처리 중 오류 발생' });
  } finally {
    connection.release();
  }
});

/**
 * @swagger
 * /api/archive/date/{date}/user/{userId}:
 *   get:
 *     summary: 특정 날짜의 아카이브 데이터 조회
 *     tags: [Archive]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: 조회할 날짜 (YYYY-MM-DD)
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 아카이브 데이터 조회 성공
 */
router.get('/date/:date/user/:userId', async (req, res) => {
  try {
    const { date, userId } = req.params;
    
    const [archives] = await db.execute(
      'SELECT * FROM daily_archives WHERE archive_date = ? AND user_id = ?',
      [date, userId]
    );
    
    if (archives.length === 0) {
      return res.status(404).json({ 
        message: '해당 날짜의 아카이브 데이터가 없습니다.' 
      });
    }
    
    const archive = archives[0];
    
    // 안전한 JSON 파싱 함수
    const safeParseJson = (str) => {
      if (!str || str === 'null' || str === '[]') return [];
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const response = {
      id: archive.id,
      archive_date: archive.archive_date,
      user_id: archive.user_id,
      breakfast_data: safeParseJson(archive.breakfast_data),
      lunch_data: safeParseJson(archive.lunch_data),
      dinner_data: safeParseJson(archive.dinner_data),
      snack_data: safeParseJson(archive.snack_data),
      exercise_data: safeParseJson(archive.exercise_data),
      weight_data: safeParseJson(archive.weight_data),
      daily_review_data: safeParseJson(archive.daily_review_data),
      created_at: archive.created_at
    };
    
    res.json(response);
  } catch (error) {
    console.error('아카이브 조회 오류:', error);
    res.status(500).json({ error: '아카이브 데이터 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;