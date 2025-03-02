const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * /api/emr/data:
 *   get:
 *     summary: EMR 데이터 목록 조회
 *     tags: [EMR]
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: 특정 환자 ID로 필터링 (선택 사항)
 *     responses:
 *       200:
 *         description: EMR 데이터 목록
 *       500:
 *         description: 서버 오류
 */
router.get('/data', async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = `
      SELECT id, patient_name, patient_id, email, phone, birth_date, gender,
             ast, alt, ggt, medical_record, prescription_record, waist_circumference,
             bmi, glucose, hba1c, triglyceride, ldl, hdl, uric_acid,
             sbp, dbp, gfr, plt, created_at, last_updated
      FROM emr_data
    `;
    const params = [];
    
    if (patientId) {
      query += ' WHERE patient_id = ?';
      params.push(patientId);
    }
    
    query += ' ORDER BY id ASC';
    
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('EMR 데이터 조회 오류:', error);
    res.status(500).json({ error: 'EMR 데이터를 조회하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
