const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * components:
 *   schemas:
 *     DinnerRecord:
 *       type: object
 *       required:
 *         - dinner_text
 *         - dinner_date
 *         - user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: 저녁 식사 기록 ID
 *         dinner_text:
 *           type: string
 *           description: 저녁 식사 내용 텍스트
 *         dinner_date:
 *           type: string
 *           format: date
 *           description: 저녁 식사 날짜 (YYYY-MM-DD)
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
 * /api/dinner:
 *   post:
 *     summary: 새 저녁 식사 기록 추가
 *     tags: [Dinner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dinner_text
 *               - dinner_date
 *               - user_id
 *             properties:
 *               dinner_text:
 *                 type: string
 *                 description: 저녁 식사 내용 텍스트
 *               dinner_date:
 *                 type: string
 *                 format: date
 *                 description: 저녁 식사 날짜 (YYYY-MM-DD)
 *               user_id:
 *                 type: integer
 *                 description: 사용자 ID
 *     responses:
 *       201:
 *         description: 저녁 식사 기록이 성공적으로 추가됨
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/', async (req, res) => {
  try {
    const {
      dinner_text,
      dinner_date,
      user_id
    } = req.body;
    
    // 필수 필드 검증
    if (!dinner_text || !dinner_date || !user_id) {
      return res.status(400).json({ message: '저녁 식사 내용, 날짜, 사용자 ID는 필수 항목입니다.' });
    }
    
    // 저녁 식사 기록 추가
    const [result] = await db.execute(`
      INSERT INTO dinner_records (
        dinner_text, dinner_date, user_id
      ) VALUES (?, ?, ?)
    `, [
      dinner_text,
      dinner_date,
      user_id
    ]);
    
    res.status(201).json({
      id: result.insertId,
      message: '저녁 식사 기록이 성공적으로 추가되었습니다.',
      dinner_record: {
        id: result.insertId,
        dinner_text,
        dinner_date,
        user_id,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('저녁 식사 기록 추가 오류:', error);
    res.status(500).json({ error: '저녁 식사 기록을 추가하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/dinner/user/{userId}:
 *   get:
 *     summary: 특정 사용자의 저녁 식사 기록 조회
 *     tags: [Dinner]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자의 저녁 식사 기록 목록
 *       500:
 *         description: 서버 오류
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // 사용자의 저녁 식사 기록 조회
    const [records] = await db.execute(`
      SELECT * FROM dinner_records
      WHERE user_id = ?
      ORDER BY dinner_date DESC, created_at DESC
    `, [userId]);
    
    res.json(records);
  } catch (error) {
    console.error('저녁 식사 기록 조회 오류:', error);
    res.status(500).json({ error: '저녁 식사 기록을 조회하는 중 오류가 발생했습니다.' });
  }
});


/**
 * @swagger
 * /api/dinner/{id}/user/{userId}:
 *   delete:
 *     summary: 특정 사용자의 특정 저녁 식사 기록 삭제
 *     tags: [Dinner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 저녁 식사 기록 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 저녁 식사 기록이 성공적으로 삭제됨
 *       403:
 *         description: 권한 없음 (다른 사용자의 저녁 식사 기록)
 *       404:
 *         description: 저녁 식사 기록을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id/user/:userId', async (req, res) => {
  try {
    const recordId = req.params.id;
    const userId = req.params.userId;
    
    // 저녁 식사 기록 존재 여부 및 사용자 소유권 확인
    const [records] = await db.execute(
      'SELECT * FROM dinner_records WHERE id = ? AND user_id = ?', 
      [recordId, userId]
    );
    
    if (records.length === 0) {
      // 기록이 존재하는지 먼저 확인
      const [recordExists] = await db.execute('SELECT * FROM dinner_records WHERE id = ?', [recordId]);
      
      if (recordExists.length === 0) {
        return res.status(404).json({ message: '저녁 식사 기록을 찾을 수 없습니다.' });
      } else {
        // 기록은 존재하지만 사용자 ID가 일치하지 않음
        return res.status(403).json({ message: '이 저녁 식사 기록을 삭제할 권한이 없습니다.' });
      }
    }
    
    // 저녁 식사 기록 삭제
    await db.execute('DELETE FROM dinner_records WHERE id = ? AND user_id = ?', [recordId, userId]);
    
    res.json({
      message: '저녁 식사 기록이 성공적으로 삭제되었습니다.',
      deleted_record: records[0]
    });
  } catch (error) {
    console.error('저녁 식사 기록 삭제 오류:', error);
    res.status(500).json({ error: '저녁 식사 기록을 삭제하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/dinner/{id}/user/{userId}:
 *   put:
 *     summary: 특정 사용자의 저녁 식사 기록 업데이트
 *     tags: [Dinner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 저녁 식사 기록 ID
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
 *             properties:
 *               dinner_text:
 *                 type: string
 *                 description: 업데이트할 저녁 식사 내용 텍스트
 *               dinner_date:
 *                 type: string
 *                 format: date
 *                 description: 업데이트할 저녁 식사 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 저녁 식사 기록이 성공적으로 업데이트됨
 *       400:
 *         description: 잘못된 요청
 *       403:
 *         description: 권한 없음 (다른 사용자의 저녁 식사 기록)
 *       404:
 *         description: 저녁 식사 기록을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put('/:id/user/:userId', async (req, res) => {
  try {
    const recordId = req.params.id;
    const userId = req.params.userId;
    const { dinner_text, dinner_date } = req.body;
    
    // 필수 필드 검증
    if (!dinner_text && !dinner_date) {
      return res.status(400).json({ message: '업데이트할 내용이 없습니다. 저녁 식사 내용 또는 날짜를 제공해주세요.' });
    }
    
    // 저녁 식사 기록 존재 여부 및 사용자 소유권 확인
    const [records] = await db.execute(
      'SELECT * FROM dinner_records WHERE id = ? AND user_id = ?', 
      [recordId, userId]
    );
    
    if (records.length === 0) {
      // 기록이 존재하는지 먼저 확인
      const [recordExists] = await db.execute('SELECT * FROM dinner_records WHERE id = ?', [recordId]);
      
      if (recordExists.length === 0) {
        return res.status(404).json({ message: '저녁 식사 기록을 찾을 수 없습니다.' });
      } else {
        // 기록은 존재하지만 사용자 ID가 일치하지 않음
        return res.status(403).json({ message: '이 저녁 식사 기록을 수정할 권한이 없습니다.' });
      }
    }
    
    // 업데이트할 필드 구성
    const updateFields = [];
    const updateValues = [];
    
    if (dinner_text) {
      updateFields.push('dinner_text = ?');
      updateValues.push(dinner_text);
    }
    
    if (dinner_date) {
      updateFields.push('dinner_date = ?');
      updateValues.push(dinner_date);
    }
    
    // 마지막 업데이트 시간 추가
    updateFields.push('last_updated = CURRENT_TIMESTAMP');
    
    // 파라미터에 ID와 사용자 ID 추가
    updateValues.push(recordId, userId);
    
    // 저녁 식사 기록 업데이트
    await db.execute(
      `UPDATE dinner_records SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );
    
    // 업데이트된 기록 조회
    const [updatedRecord] = await db.execute(
      'SELECT * FROM dinner_records WHERE id = ?',
      [recordId]
    );
    
    res.json({
      message: '저녁 식사 기록이 성공적으로 업데이트되었습니다.',
      updated_record: updatedRecord[0]
    });
  } catch (error) {
    console.error('저녁 식사 기록 업데이트 오류:', error);
    res.status(500).json({ error: '저녁 식사 기록을 업데이트하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;