const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 지방간 지수(FLI) 계산 함수
function calculateFLI(tg, bmi, ggt, wc) {
  if (!tg || !bmi || !ggt || !wc) return null;
  
  const exponent = 0.953 * Math.log(tg) + 
                  0.139 * bmi + 
                  0.718 * Math.log(ggt) + 
                  0.053 * wc - 
                  15.745;
  
  const fli = (Math.exp(exponent) / (1 + Math.exp(exponent))) * 100;
  return Math.round(fli * 100) / 100;
}

// 간지방증 지수(HSI) 계산 함수
function calculateHSI(alt, ast, bmi, gender, hasDiabetes) {
  if (!alt || !ast || !bmi) return null;
  
  let hsi = 8 * (alt / ast) + bmi;
  
  // 성별에 따른 가중치 추가
  if (gender === 'F') {
    hsi += 2;
  }
  
  // 당뇨병 여부에 따른 가중치 추가
  if (hasDiabetes) {
    hsi += 2;
  }
  
  return Math.round(hsi * 100) / 100;
}

// 지방간 지수 해석 함수
function interpretFLI(fli) {
  if (fli === null) return '계산 불가';
  if (fli < 30) return '지방간 가능성 낮음';
  if (fli >= 60) return '지방간 가능성 높음';
  return '중간 정도의 지방간 가능성';
}

// 간지방증 지수 해석 함수
function interpretHSI(hsi) {
  if (hsi === null) return '계산 불가';
  if (hsi > 36) return '지방간 가능성 높음';
  if (hsi < 30) return '지방간 가능성 낮음';
  return '중간 정도의 지방간 가능성';
}

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

/**
 * @swagger
 * /api/emr/available-patients:
 *   get:
 *     summary: 사용자와 연결되지 않은 환자 ID 목록 조회
 *     tags: [EMR]
 *     responses:
 *       200:
 *         description: 사용 가능한 환자 ID 목록
 *       500:
 *         description: 서버 오류
 */
router.get('/available-patients', async (req, res) => {
  try {
    // 사용자와 연결되지 않은 환자 ID 조회
    const [rows] = await db.execute(`
      SELECT e.id, e.patient_name, e.patient_id, e.email
      FROM emr_data e
      LEFT JOIN users u ON e.patient_id = u.patient_id
      WHERE u.id IS NULL
      ORDER BY e.id ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('사용 가능한 환자 ID 조회 오류:', error);
    res.status(500).json({ error: '사용 가능한 환자 ID를 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/emr/fatty-liver-indices/{patientId}:
 *   get:
 *     summary: 환자의 지방간 지수(FLI)와 간지방증 지수(HSI) 계산
 *     tags: [EMR]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: 환자 ID
 *     responses:
 *       200:
 *         description: 지방간 지수 계산 결과
 *       404:
 *         description: 환자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/fatty-liver-indices/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // 환자의 EMR 데이터 조회
    const [patients] = await db.execute(`
      SELECT patient_name, patient_id, gender, bmi, triglyceride, ggt, waist_circumference,
             alt, ast, glucose, hba1c
      FROM emr_data
      WHERE patient_id = ?
    `, [patientId]);
    
    if (patients.length === 0) {
      return res.status(404).json({ message: '환자를 찾을 수 없습니다.' });
    }
    
    const patient = patients[0];
    
    // 당뇨병 여부 판단 (혈당 126mg/dL 이상 또는 HbA1c 6.5% 이상)
    const hasDiabetes = patient.glucose >= 126 || patient.hba1c >= 6.5;
    
    // 지수 계산
    const fli = calculateFLI(
      patient.triglyceride,
      patient.bmi,
      patient.ggt,
      patient.waist_circumference
    );
    
    const hsi = calculateHSI(
      patient.alt,
      patient.ast,
      patient.bmi,
      patient.gender,
      hasDiabetes
    );
    
    // 결과 반환
    res.json({
      patient_name: patient.patient_name,
      patient_id: patient.patient_id,
      indices: {
        fli: {
          value: fli,
          interpretation: interpretFLI(fli)
        },
        hsi: {
          value: hsi,
          interpretation: interpretHSI(hsi)
        }
      },
      reference_values: {
        triglyceride: patient.triglyceride,
        bmi: patient.bmi,
        ggt: patient.ggt,
        waist_circumference: patient.waist_circumference,
        alt: patient.alt,
        ast: patient.ast,
        has_diabetes: hasDiabetes
      }
    });
  } catch (error) {
    console.error('지방간 지수 계산 오류:', error);
    res.status(500).json({ error: '지방간 지수를 계산하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/emr/diagnosis/{patientId}:
 *   post:
 *     summary: 환자의 진단 상세 정보 저장
 *     tags: [EMR]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: 환자 ID
 *     responses:
 *       200:
 *         description: 진단 상세 정보가 성공적으로 저장됨
 *       404:
 *         description: 환자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post('/diagnosis/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // 환자의 EMR 데이터 조회
    const [patients] = await db.execute(`
      SELECT patient_name, patient_id, gender, bmi, triglyceride, ggt, waist_circumference,
             alt, ast, glucose, hba1c
      FROM emr_data
      WHERE patient_id = ?
    `, [patientId]);
    
    if (patients.length === 0) {
      return res.status(404).json({ message: '환자를 찾을 수 없습니다.' });
    }
    
    const patient = patients[0];
    
    // 당뇨병 여부 판단
    const hasDiabetes = patient.glucose >= 126 || patient.hba1c >= 6.5;
    
    // 지수 계산
    const fli = calculateFLI(
      patient.triglyceride,
      patient.bmi,
      patient.ggt,
      patient.waist_circumference
    );
    
    const hsi = calculateHSI(
      patient.alt,
      patient.ast,
      patient.bmi,
      patient.gender,
      hasDiabetes
    );
    
    // 진단 상세 정보 저장
    await db.execute(`
      INSERT INTO diagnosis_details (
        patient_id, fli_score, fli_interpretation, hsi_score, hsi_interpretation, has_diabetes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      patientId,
      fli,
      interpretFLI(fli),
      hsi,
      interpretHSI(hsi),
      hasDiabetes
    ]);
    
    res.json({
      message: '진단 상세 정보가 성공적으로 저장되었습니다.',
      diagnosis: {
        patient_name: patient.patient_name,
        patient_id: patient.patient_id,
        indices: {
          fli: {
            value: fli,
            interpretation: interpretFLI(fli)
          },
          hsi: {
            value: hsi,
            interpretation: interpretHSI(hsi)
          }
        },
        has_diabetes: hasDiabetes
      }
    });
  } catch (error) {
    console.error('진단 상세 정보 저장 오류:', error);
    res.status(500).json({ error: '진단 상세 정보를 저장하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/emr/diagnosis/{patientId}:
 *   get:
 *     summary: 환자의 진단 상세 정보 조회
 *     tags: [EMR]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: 환자 ID
 *     responses:
 *       200:
 *         description: 진단 상세 정보
 *       404:
 *         description: 진단 정보를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/diagnosis/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // 환자의 진단 상세 정보 조회
    const [diagnoses] = await db.execute(`
      SELECT d.*, e.patient_name
      FROM diagnosis_details d
      JOIN emr_data e ON d.patient_id = e.patient_id
      WHERE d.patient_id = ?
      ORDER BY d.diagnosis_date DESC
    `, [patientId]);
    
    if (diagnoses.length === 0) {
      return res.status(404).json({ message: '진단 정보를 찾을 수 없습니다.' });
    }
    
    res.json({
      patient_name: diagnoses[0].patient_name,
      patient_id: diagnoses[0].patient_id,
      diagnoses: diagnoses.map(d => ({
        diagnosis_date: d.diagnosis_date,
        fli: {
          score: d.fli_score,
          interpretation: d.fli_interpretation
        },
        hsi: {
          score: d.hsi_score,
          interpretation: d.hsi_interpretation
        },
        has_diabetes: d.has_diabetes,
        created_at: d.created_at,
        last_updated: d.last_updated
      }))
    });
  } catch (error) {
    console.error('진단 상세 정보 조회 오류:', error);
    res.status(500).json({ error: '진단 상세 정보를 조회하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
