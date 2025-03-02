const db = require('../config/db');
const nodemailer = require('nodemailer');

// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
  service: 'gmail', // 또는 다른 이메일 서비스
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 난수 생성 함수
function generateAuthCode(length = 6) {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

// EMR 데이터 조회
async function getEmrData(patientId = null) {
  try {
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
    
    // ID 순서대로 정렬
    query += ' ORDER BY id ASC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  } catch (error) {
    console.error('EMR 데이터 조회 오류:', error);
    throw error;
  }
}

// 인증 코드 생성 및 이메일 전송
async function generateAndSendAuthCode(patientId) {
  try {
    // 환자 정보 조회
    const [patients] = await db.execute(
      'SELECT * FROM emr_data WHERE patient_id = ?',
      [patientId]
    );
    
    if (patients.length === 0) {
      throw new Error('환자 정보를 찾을 수 없습니다.');
    }
    
    const patient = patients[0];
    
    // 인증 코드 생성
    const authCode = generateAuthCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10분 후 만료
    
    // 인증 코드 저장
    await db.execute(
      'INSERT INTO auth_codes (patient_id, auth_code, expires_at) VALUES (?, ?, ?)',
      [patientId, authCode, expiresAt]
    );
    
    // 이메일 전송
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: '인증 코드 안내',
      text: `안녕하세요 ${patient.patient_name}님,\n\n인증 코드는 ${authCode} 입니다.\n이 코드는 10분 후에 만료됩니다.\n\n감사합니다.`
    };
    
    await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      message: '인증 코드가 생성되어 이메일로 전송되었습니다.'
    };
  } catch (error) {
    console.error('인증 코드 생성 및 전송 오류:', error);
    throw error;
  }
}

// 인증 코드 검증
async function verifyAuthCode(patientId, authCode) {
  try {
    // 유효한 인증 코드 조회
    const [codes] = await db.execute(
      'SELECT * FROM auth_codes WHERE patient_id = ? AND auth_code = ? AND expires_at > NOW() AND is_used = FALSE ORDER BY created_at DESC LIMIT 1',
      [patientId, authCode]
    );
    
    if (codes.length === 0) {
      return {
        success: false,
        message: '유효하지 않은 인증 코드입니다.'
      };
    }
    
    // 인증 코드 사용 처리
    await db.execute(
      'UPDATE auth_codes SET is_used = TRUE WHERE id = ?',
      [codes[0].id]
    );
    
    // 검증된 코드 저장
    await db.execute(
      'INSERT INTO verified_codes (patient_id, auth_code) VALUES (?, ?)',
      [patientId, authCode]
    );
    
    // 사용자 관리 테이블에 정보 추가 또는 업데이트
    const [existingUser] = await db.execute(
      'SELECT * FROM user_management WHERE patient_id = ?',
      [patientId]
    );
    
    if (existingUser.length === 0) {
      // 새 사용자 추가
      await db.execute(
        'INSERT INTO user_management (patient_id) VALUES (?)',
        [patientId]
      );
    } else {
      // 기존 사용자 로그인 시간 업데이트
      await db.execute(
        'UPDATE user_management SET last_login = NOW() WHERE patient_id = ?',
        [patientId]
      );
    }
    
    return {
      success: true,
      message: '인증이 성공적으로 완료되었습니다.'
    };
  } catch (error) {
    console.error('인증 코드 검증 오류:', error);
    throw error;
  }
}

module.exports = {
  generateAndSendAuthCode,
  verifyAuthCode,
  getEmrData
}; 