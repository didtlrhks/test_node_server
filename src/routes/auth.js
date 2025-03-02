const express = require('express');
const router = express.Router();
const authService = require('../services/auth-service');

/**
 * @swagger
 * /api/auth/generate-code:
 *   post:
 *     summary: 인증 코드 생성 및 이메일 전송
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 인증 코드 생성 및 전송 성공
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/generate-code', async (req, res) => {
  try {
    const { patientId } = req.body;
    
    if (!patientId) {
      return res.status(400).json({ message: '환자 ID가 필요합니다.' });
    }
    
    const result = await authService.generateAndSendAuthCode(patientId);
    res.json(result);
  } catch (error) {
    console.error('인증 코드 생성 오류:', error);
    res.status(500).json({ error: '인증 코드를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/auth/verify-code:
 *   post:
 *     summary: 인증 코드 검증
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - authCode
 *             properties:
 *               patientId:
 *                 type: string
 *               authCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: 인증 코드 검증 결과
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/verify-code', async (req, res) => {
  try {
    const { patientId, authCode } = req.body;
    
    if (!patientId || !authCode) {
      return res.status(400).json({ message: '환자 ID와 인증 코드가 필요합니다.' });
    }
    
    const result = await authService.verifyAuthCode(patientId, authCode);
    res.json(result);
  } catch (error) {
    console.error('인증 코드 검증 오류:', error);
    res.status(500).json({ error: '인증 코드를 검증하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/auth/emr-data:
 *   get:
 *     summary: EMR 데이터 목록 조회
 *     tags: [Auth]
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
router.get('/emr-data', async (req, res) => {
  try {
    const { patientId } = req.query;
    const emrData = await authService.getEmrData(patientId);
    res.json(emrData);
  } catch (error) {
    console.error('EMR 데이터 조회 오류:', error);
    res.status(500).json({ error: 'EMR 데이터를 조회하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 