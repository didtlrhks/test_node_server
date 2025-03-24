const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * components:
 *   schemas:
 *     DailyReview:
 *       type: object
 *       required:
 *         - user_id
 *         - review_date
 *         - hunger_option
 *         - hunger_text
 *         - sleep_option
 *         - sleep_text
 *         - activity_option
 *         - activity_text
 *         - emotion_option
 *         - emotion_text
 *         - alcohol_option
 *         - alcohol_text
 *       properties:
 *         id:
 *           type: integer
 *           description: 하루 리뷰 ID
 *         user_id:
 *           type: integer
 *           description: 사용자 ID
 *         review_date:
 *           type: string
 *           format: date
 *           description: 리뷰 날짜 (YYYY-MM-DD)
 *         hunger_option:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 배고픔 옵션 번호 (1-5)
 *         hunger_text:
 *           type: string
 *           description: 배고픔 옵션 텍스트
 *         sleep_option:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 수면 옵션 번호 (1-5)
 *         sleep_text:
 *           type: string
 *           description: 수면 옵션 텍스트
 *         activity_option:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 활동량 옵션 번호 (1-5)
 *         activity_text:
 *           type: string
 *           description: 활동량 옵션 텍스트
 *         emotion_option:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 감정 옵션 번호 (1-5)
 *         emotion_text:
 *           type: string
 *           description: 감정 옵션 텍스트
 *         alcohol_option:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 음주 옵션 번호 (1-5)
 *         alcohol_text:
 *           type: string
 *           description: 음주 옵션 텍스트
 *         comment:
 *           type: string
 *           description: 추가 코멘트 (선택 사항)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 생성 시간
 *         last_updated:
 *           type: string
 *           format: date-time
 *           description: 마지막 업데이트 시간
 */

/**
 * @swagger
 * /api/daily-review:
 *   post:
 *     summary: 새 하루 리뷰 추가
 *     tags: [DailyReview]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - review_date
 *               - hunger_option
 *               - hunger_text
 *               - sleep_option
 *               - sleep_text
 *               - activity_option
 *               - activity_text
 *               - emotion_option
 *               - emotion_text
 *               - alcohol_option
 *               - alcohol_text
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: 사용자 ID
 *               review_date:
 *                 type: string
 *                 format: date
 *                 description: 리뷰 날짜 (YYYY-MM-DD)
 *               hunger_option:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 배고픔 옵션 번호 (1-5)
 *               hunger_text:
 *                 type: string
 *                 description: 배고픔 옵션 텍스트
 *               sleep_option:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 수면 옵션 번호 (1-5)
 *               sleep_text:
 *                 type: string
 *                 description: 수면 옵션 텍스트
 *               activity_option:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 활동량 옵션 번호 (1-5)
 *               activity_text:
 *                 type: string
 *                 description: 활동량 옵션 텍스트
 *               emotion_option:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 감정 옵션 번호 (1-5)
 *               emotion_text:
 *                 type: string
 *                 description: 감정 옵션 텍스트
 *               alcohol_option:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 음주 옵션 번호 (1-5)
 *               alcohol_text:
 *                 type: string
 *                 description: 음주 옵션 텍스트
 *               comment:
 *                 type: string
 *                 description: 추가 코멘트 (선택 사항)
 *     responses:
 *       201:
 *         description: 하루 리뷰가 성공적으로 추가됨
 *       400:
 *         description: 잘못된 요청
 *       409:
 *         description: 이미 해당 날짜에 리뷰가 존재함
 *       500:
 *         description: 서버 오류
 */
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      review_date,
      hunger_option,
      hunger_text,
      sleep_option,
      sleep_text,
      activity_option,
      activity_text,
      emotion_option,
      emotion_text,
      alcohol_option,
      alcohol_text,
      comment  // 선택적 필드
    } = req.body;
    
    // 필수 필드 검증
    if (!user_id || !review_date || 
        !hunger_option || !hunger_text || 
        !sleep_option || !sleep_text || 
        !activity_option || !activity_text || 
        !emotion_option || !emotion_text || 
        !alcohol_option || !alcohol_text) {
      return res.status(400).json({ message: '모든 필수 필드를 입력해주세요.' });
    }
    
    // 옵션 범위 검증 (1-5)
    if (hunger_option < 1 || hunger_option > 5 ||
        sleep_option < 1 || sleep_option > 5 ||
        activity_option < 1 || activity_option > 5 ||
        emotion_option < 1 || emotion_option > 5 ||
        alcohol_option < 1 || alcohol_option > 5) {
      return res.status(400).json({ message: '옵션 값은 1부터 5 사이여야 합니다.' });
    }
    
    // 같은 날짜에 이미 리뷰가 있는지 확인
    const [existingReviews] = await db.execute(
      'SELECT * FROM daily_reviews WHERE user_id = ? AND review_date = ?',
      [user_id, review_date]
    );
    
    // 이미 있는 경우 업데이트
    if (existingReviews.length > 0) {
      await db.execute(`
        UPDATE daily_reviews 
        SET 
          hunger_option = ?,
          hunger_text = ?,
          sleep_option = ?,
          sleep_text = ?,
          activity_option = ?,
          activity_text = ?,
          emotion_option = ?,
          emotion_text = ?,
          alcohol_option = ?,
          alcohol_text = ?,
          comment = ?,
          last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ? AND review_date = ?
      `, [
        hunger_option, hunger_text,
        sleep_option, sleep_text,
        activity_option, activity_text,
        emotion_option, emotion_text,
        alcohol_option, alcohol_text,
        comment || null,  // comment가 없는 경우 null 저장
        user_id, review_date
      ]);
      
      const [updatedReview] = await db.execute(
        'SELECT * FROM daily_reviews WHERE user_id = ? AND review_date = ?',
        [user_id, review_date]
      );
      
      return res.json({
        message: '하루 리뷰가 성공적으로 업데이트되었습니다.',
        review: updatedReview[0]
      });
    }
    
    // 새 리뷰 추가 (SQL 쿼리 생성)
    let sql, params;
    
    if (comment) {
      // comment가 있는 경우
      sql = `
        INSERT INTO daily_reviews (
          user_id, review_date, 
          hunger_option, hunger_text, 
          sleep_option, sleep_text, 
          activity_option, activity_text, 
          emotion_option, emotion_text, 
          alcohol_option, alcohol_text,
          comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      params = [
        user_id, review_date,
        hunger_option, hunger_text,
        sleep_option, sleep_text,
        activity_option, activity_text,
        emotion_option, emotion_text,
        alcohol_option, alcohol_text,
        comment
      ];
    } else {
      // comment가 없는 경우
      sql = `
        INSERT INTO daily_reviews (
          user_id, review_date, 
          hunger_option, hunger_text, 
          sleep_option, sleep_text, 
          activity_option, activity_text, 
          emotion_option, emotion_text, 
          alcohol_option, alcohol_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      params = [
        user_id, review_date,
        hunger_option, hunger_text,
        sleep_option, sleep_text,
        activity_option, activity_text,
        emotion_option, emotion_text,
        alcohol_option, alcohol_text
      ];
    }
    
    // 쿼리 실행
    const [result] = await db.execute(sql, params);
    
    // 응답 객체 생성
    const responseReview = {
      id: result.insertId,
      user_id,
      review_date,
      hunger_option, 
      hunger_text,
      sleep_option, 
      sleep_text,
      activity_option, 
      activity_text,
      emotion_option, 
      emotion_text,
      alcohol_option, 
      alcohol_text,
      created_at: new Date()
    };
    
    // comment가 있는 경우만 추가
    if (comment) {
      responseReview.comment = comment;
    }
    
    res.status(201).json({
      id: result.insertId,
      message: '하루 리뷰가 성공적으로 추가되었습니다.',
      review: responseReview
    });
  } catch (error) {
    console.error('하루 리뷰 추가 오류:', error);
    res.status(500).json({ error: '하루 리뷰를 추가하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/daily-review/user/{userId}:
 *   get:
 *     summary: 특정 사용자의 모든 하루 리뷰 조회
 *     tags: [DailyReview]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자의 하루 리뷰 목록
 *       500:
 *         description: 서버 오류
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // 사용자의 모든 하루 리뷰 조회
    const [reviews] = await db.execute(`
      SELECT * FROM daily_reviews
      WHERE user_id = ?
      ORDER BY review_date DESC
    `, [userId]);
    
    res.json(reviews);
  } catch (error) {
    console.error('하루 리뷰 조회 오류:', error);
    res.status(500).json({ error: '하루 리뷰를 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/daily-review/date/{date}/user/{userId}:
 *   get:
 *     summary: 특정 날짜의 사용자 하루 리뷰 조회
 *     tags: [DailyReview]
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
 *         description: 특정 날짜의 하루 리뷰
 *       404:
 *         description: 해당 날짜의 하루 리뷰를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/date/:date/user/:userId', async (req, res) => {
  try {
    const { date, userId } = req.params;
    
    // 특정 날짜의 하루 리뷰 조회
    const [reviews] = await db.execute(`
      SELECT * FROM daily_reviews
      WHERE review_date = ? AND user_id = ?
    `, [date, userId]);
    
    if (reviews.length === 0) {
      return res.status(404).json({ message: '해당 날짜의 하루 리뷰를 찾을 수 없습니다.' });
    }
    
    res.json(reviews[0]);
  } catch (error) {
    console.error('하루 리뷰 조회 오류:', error);
    res.status(500).json({ error: '하루 리뷰를 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/daily-review/{id}/user/{userId}:
 *   delete:
 *     summary: 특정 하루 리뷰 삭제
 *     tags: [DailyReview]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 하루 리뷰 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 하루 리뷰가 성공적으로 삭제됨
 *       403:
 *         description: 권한 없음 (다른 사용자의 하루 리뷰)
 *       404:
 *         description: 하루 리뷰를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id/user/:userId', async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.params.userId;
    
    // 하루 리뷰 존재 여부 및 사용자 소유권 확인
    const [reviews] = await db.execute(
      'SELECT * FROM daily_reviews WHERE id = ? AND user_id = ?', 
      [reviewId, userId]
    );
    
    if (reviews.length === 0) {
      // 리뷰가 존재하는지 먼저 확인
      const [reviewExists] = await db.execute('SELECT * FROM daily_reviews WHERE id = ?', [reviewId]);
      
      if (reviewExists.length === 0) {
        return res.status(404).json({ message: '하루 리뷰를 찾을 수 없습니다.' });
      } else {
        // 리뷰는 존재하지만 사용자 ID가 일치하지 않음
        return res.status(403).json({ message: '이 하루 리뷰를 삭제할 권한이 없습니다.' });
      }
    }
    
    // 하루 리뷰 삭제
    await db.execute('DELETE FROM daily_reviews WHERE id = ? AND user_id = ?', [reviewId, userId]);
    
    res.json({
      message: '하루 리뷰가 성공적으로 삭제되었습니다.',
      deleted_review: reviews[0]
    });
  } catch (error) {
    console.error('하루 리뷰 삭제 오류:', error);
    res.status(500).json({ error: '하루 리뷰를 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 