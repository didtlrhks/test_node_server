const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 지방간 지수(FLI) 계산 함수
function calculateFLI(age, ast, plt, alt) {
  if (!age || !ast || !plt || !alt) return null;
  
  // 공식: 연령*AST/(혈소판*ALT^0.5)
  const fli = (age * ast) / (plt * Math.sqrt(alt));
  return Math.round(fli * 100) / 100;
}

// 지방간 섬유화 지수 계산 함수
function calculateFibrosis(age, bmi, hasDiabetes, ast, alt, plt, albumin) {
  if (!age || !bmi || !ast || !alt || !plt || !albumin) return null;
  
  // AST/ALT 비율 계산
  const astAltRatio = ast / alt;
  
  // 공식: -1.675 + 0.037 * 연령 + 0.094 * 체질량지수 + 1.13 * 당뇨병 + 0.99 * AST/ALT비율 - 0.013 * 혈소판 + 0.66 * 알부민
  const fibrosis = -1.675 + 
                   0.037 * age + 
                   0.094 * bmi + 
                   1.13 * (hasDiabetes ? 1 : 0) + 
                   0.99 * astAltRatio - 
                   0.013 * plt + 
                   0.66 * albumin;
                   
  return Math.round(fibrosis * 100) / 100;
}

// 지방간 지수 해석 함수
function interpretFLI(fli) {
  if (fli === null) return '계산 불가';
  if (fli < 2) return '지방간 가능성 낮음';
  return '지방간 가능성 높음';
}

// 지방간 섬유화 지수 해석 함수
function interpretFibrosis(score) {
  if (score === null) return '계산 불가';
  if (score < -1.455) return '섬유화 낮음';
  return '섬유화 위험 높음';
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
 *     summary: 환자의 지방간 지수(FLI)와 섬유화 지수 계산
 *     description: |
 *       두 가지 지수를 계산합니다:
 *       1. 지방간 지수(FLI) = 연령*AST/(혈소판*ALT^0.5)
 *          - < 2: 지방간 가능성 낮음
 *          - ≥ 2: 지방간 가능성 높음
 *       
 *       2. 섬유화 지수 = -1.675 + 0.037*연령 + 0.094*BMI + 1.13*당뇨병 + 0.99*AST/ALT비율 - 0.013*혈소판 + 0.66*알부민
 *          - < -1.455: 섬유화 낮음
 *          - ≥ -1.455: 섬유화 위험 높음
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient_name:
 *                   type: string
 *                   description: 환자 이름
 *                 patient_id:
 *                   type: string
 *                   description: 환자 ID
 *                 indices:
 *                   type: object
 *                   properties:
 *                     fli:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           description: 지방간 지수 값
 *                         interpretation:
 *                           type: string
 *                           description: 지방간 지수 해석
 *                     fibrosis:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           description: 섬유화 지수 값
 *                         interpretation:
 *                           type: string
 *                           description: 섬유화 지수 해석
 *                 reference_values:
 *                   type: object
 *                   properties:
 *                     age:
 *                       type: number
 *                       description: 연령
 *                     ast:
 *                       type: number
 *                       description: AST 수치
 *                     alt:
 *                       type: number
 *                       description: ALT 수치
 *                     plt:
 *                       type: number
 *                       description: 혈소판 수치
 *                     bmi:
 *                       type: number
 *                       description: 체질량지수
 *                     albumin:
 *                       type: number
 *                       description: 알부민 수치
 *                     has_diabetes:
 *                       type: boolean
 *                       description: 당뇨병 여부
 *       404:
 *         description: 환자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/fatty-liver-indices/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // 환자의 EMR 데이터 조회 (albumin 필드 추가)
    const [patients] = await db.execute(`
      SELECT patient_name, patient_id, gender, bmi, triglyceride, ggt, waist_circumference,
             alt, ast, glucose, hba1c, plt, birth_date, albumin
      FROM emr_data
      WHERE patient_id = ?
    `, [patientId]);
    
    if (patients.length === 0) {
      return res.status(404).json({ message: '환자를 찾을 수 없습니다.' });
    }
    
    const patient = patients[0];
    
    // 나이 계산
    const birthDate = new Date(patient.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    // 당뇨병 여부 판단 (혈당 126mg/dL 이상 또는 HbA1c 6.5% 이상)
    const hasDiabetes = patient.glucose >= 126 || patient.hba1c >= 6.5;
    
    // 지수 계산
    const fli = calculateFLI(
      age,
      patient.ast,
      patient.plt,
      patient.alt
    );
    
    const fibrosis = calculateFibrosis(
      age,
      patient.bmi,
      hasDiabetes,
      patient.ast,
      patient.alt,
      patient.plt,
      patient.albumin || 4.0 // albumin 값이 없으면 기본값 4.0 사용
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
        fibrosis: {
          value: fibrosis,
          interpretation: interpretFibrosis(fibrosis)
        }
      },
      reference_values: {
        age: age,
        ast: patient.ast,
        alt: patient.alt,
        plt: patient.plt,
        bmi: patient.bmi,
        albumin: patient.albumin || 4.0,
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
 *     description: |
 *       지방간 지수(FLI)와 섬유화 지수를 계산하여 저장합니다.
 *       - FLI = 연령*AST/(혈소판*ALT^0.5)
 *       - 섬유화 지수 = -1.675 + 0.037*연령 + 0.094*BMI + 1.13*당뇨병 + 0.99*AST/ALT비율 - 0.013*혈소판 + 0.66*알부민
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *                 diagnosis:
 *                   type: object
 *                   properties:
 *                     patient_name:
 *                       type: string
 *                       description: 환자 이름
 *                     patient_id:
 *                       type: string
 *                       description: 환자 ID
 *                     indices:
 *                       type: object
 *                       properties:
 *                         fli:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                               description: 지방간 지수 값
 *                             interpretation:
 *                               type: string
 *                               description: 지방간 지수 해석
 *                         fibrosis:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                               description: 섬유화 지수 값
 *                             interpretation:
 *                               type: string
 *                               description: 섬유화 지수 해석
 *                     has_diabetes:
 *                       type: boolean
 *                       description: 당뇨병 여부
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
             alt, ast, glucose, hba1c, plt, birth_date, albumin
      FROM emr_data
      WHERE patient_id = ?
    `, [patientId]);
    
    if (patients.length === 0) {
      return res.status(404).json({ message: '환자를 찾을 수 없습니다.' });
    }
    
    const patient = patients[0];
    
    // 나이 계산
    const birthDate = new Date(patient.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    // 당뇨병 여부 판단
    const hasDiabetes = patient.glucose >= 126 || patient.hba1c >= 6.5;
    
    // 지수 계산
    const fli = calculateFLI(
      age,
      patient.ast,
      patient.plt,
      patient.alt
    );
    
    const fibrosis = calculateFibrosis(
      age,
      patient.bmi,
      hasDiabetes,
      patient.ast,
      patient.alt,
      patient.plt,
      patient.albumin || 4.0
    );
    
    // 진단 상세 정보 저장
    await db.execute(`
      INSERT INTO diagnosis_details (
        patient_id, fli_score, fli_interpretation, 
        fibrosis_score, fibrosis_interpretation, has_diabetes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      patientId,
      fli,
      interpretFLI(fli),
      fibrosis,
      interpretFibrosis(fibrosis),
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
          fibrosis: {
            value: fibrosis,
            interpretation: interpretFibrosis(fibrosis)
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
        fibrosis: {
          score: d.fibrosis_score,
          interpretation: d.fibrosis_interpretation
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
