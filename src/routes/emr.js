const express = require('express');
const router = express.Router();
const db = require('../config/db');



router.get('/', async (req, res) => {
  try {
    const { patient_id } = req.query;
    let query = 'SELECT * FROM emr';
    const params = [];
    
    if (patient_id) {
      query += ' WHERE patient_id = ?';
      params.push(patient_id);
    }
    
    query += ' ORDER BY visit_date DESC';
    
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('EMR 조회 오류:', error);
    res.status(500).json({ error: 'EMR 기록을 조회하는 중 오류가 발생했습니다.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM emr WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'EMR 기록을 찾을 수 없습니다.' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('EMR 조회 오류:', error);
    res.status(500).json({ error: 'EMR 기록을 조회하는 중 오류가 발생했습니다.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, visit_date, symptoms, diagnosis, prescription, notes } = req.body;
    
    // 필수 필드 검증
    if (!patient_id || !doctor_id || !visit_date) {
      return res.status(400).json({ message: '환자 ID, 의사 ID, 방문 날짜는 필수 항목입니다.' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO emr (patient_id, doctor_id, visit_date, symptoms, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, doctor_id, visit_date, symptoms, diagnosis, prescription, notes]
    );
    
    res.status(201).json({
      id: result.insertId,
      message: 'EMR 기록이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('EMR 생성 오류:', error);
    res.status(500).json({ error: 'EMR 기록을 생성하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 