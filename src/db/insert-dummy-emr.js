const db = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { createUser } = require('../create-user');

// EMR 테이블 생성 함수
async function createEmrTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS emr (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        visit_date DATETIME NOT NULL,
        symptoms TEXT,
        diagnosis TEXT,
        prescription TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id)
      )
    `);
    console.log('EMR 테이블이 생성되었습니다.');
  } catch (error) {
    console.error('EMR 테이블 생성 오류:', error);
    throw error;
  }
}

// 더미 환자 데이터
const dummyPatients = [
  { username: '김환자', email: 'patient1@example.com', password: 'password123' },
  { username: '이환자', email: 'patient2@example.com', password: 'password123' },
  { username: '박환자', email: 'patient3@example.com', password: 'password123' }
];

// 더미 의사 데이터
const dummyDoctors = [
  { username: '김의사', email: 'doctor1@example.com', password: 'password123' },
  { username: '이의사', email: 'doctor2@example.com', password: 'password123' }
];
      
// 더미 EMR 데이터 템플릿
const dummyEmrTemplates = [
  {
    symptoms: '고열, 두통, 인후통이 3일째 지속됨',
    diagnosis: '독감 A형 의심. 빠른 회복을 위해 충분한 휴식과 수분 섭취 권장',
    prescription: '타미플루 75mg 1일 2회 5일간, 타이레놀 500mg 1일 3회 통증시',
    notes: '48시간 이내에 증상 호전이 없으면 재방문 권장'
  },
  {
    symptoms: '복통, 설사, 메스꺼움이 이틀째 지속됨. 구토 증상은 없음',
    diagnosis: '급성 위장염. 음식 조절과 충분한 수분 섭취 필요',
    prescription: '프로바이오틱스 1일 3회 7일간, 로페라마이드 2mg 설사시 복용',
    notes: '유제품과 자극적인 음식 피하도록 권고함'
  },
  {
    symptoms: '기침, 가래, 경미한 호흡곤란. 흉부 X-ray 촬영 결과 이상 소견',
    diagnosis: '경증 폐렴. 항생제 치료 시작',
    prescription: '아목시실린 500mg 1일 3회 7일간, 기침약 시럽 1일 3회 식후',
    notes: '3일 후 상태 확인을 위한 재방문 예약 완료'
  },
  {
    symptoms: '우측 무릎 통증, 부종. 계단 오르내릴 때 통증 심화',
    diagnosis: '퇴행성 관절염. 물리치료 권장',
    prescription: '소염진통제 1일 2회 식후, 관절 보호대 착용 권장',
    notes: '체중 감량과 저충격 운동 권장. 2주 후 재평가 예정'
  },
  {
    symptoms: '피부 발진, 가려움증. 새로운 세제 사용 후 증상 발현',
    diagnosis: '접촉성 피부염. 알레르기 반응으로 판단됨',
    prescription: '항히스타민제 1일 1회 취침 전, 스테로이드 연고 하루 2회 도포',
    notes: '알레르기 유발 물질 회피 교육 실시. 증상 악화 시 즉시 내원 권고'
  }
];

// 랜덤 날짜 생성 (최근 30일 이내)
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  now.setDate(now.getDate() - daysAgo);
  
  // 시간을 랜덤하게 설정
  now.setHours(9 + Math.floor(Math.random() * 8)); // 9AM - 5PM
  now.setMinutes(Math.floor(Math.random() * 60));
  now.setSeconds(Math.floor(Math.random() * 60));
  
  return now.toISOString().slice(0, 19).replace('T', ' ');
}

// 랜덤 EMR 데이터 생성
function getRandomEmr(patientId, doctorId) {
  const template = dummyEmrTemplates[Math.floor(Math.random() * dummyEmrTemplates.length)];
  return {
    patient_id: patientId,
    doctor_id: doctorId,
    visit_date: getRandomDate(),
    ...template
  };
}

// 사용자 생성 함수 (이미 존재하는 경우 ID 반환)
async function createUserIfNotExists(userData) {
  try {
    // 이메일로 사용자 검색
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [userData.email]
    );
    
    // 이미 존재하면 해당 ID 반환
    if (existingUsers.length > 0) {
      console.log(`사용자가 이미 존재합니다: ${userData.username} (${userData.email})`);
      return existingUsers[0].id;
    }
    
    // 존재하지 않으면 새로 생성
    const userId = await createUser(userData.username, userData.email, userData.password);
    console.log(`새 사용자 생성: ${userData.username} (ID: ${userId})`);
    return userId;
  } catch (error) {
    console.error(`사용자 생성 오류 (${userData.email}):`, error);
    throw error;
  }
}

// EMR 데이터 삽입
async function insertEmr(emrData) {
  try {
    const [result] = await db.execute(
      `INSERT INTO emr 
       (patient_id, doctor_id, visit_date, symptoms, diagnosis, prescription, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        emrData.patient_id,
        emrData.doctor_id,
        emrData.visit_date,
        emrData.symptoms,
        emrData.diagnosis,
        emrData.prescription,
        emrData.notes
      ]
    );
    
    console.log(`EMR 데이터 생성 완료 (ID: ${result.insertId})`);
    return result.insertId;
  } catch (error) {
    console.error('EMR 데이터 삽입 오류:', error);
    throw error;
  }
}

// 메인 함수
async function insertDummyData() {
  try {
    console.log('더미 데이터 삽입 시작...');
    
    // 환자 데이터 생성
    const patientIds = [];
    for (const patient of dummyPatients) {
      const patientId = await createUserIfNotExists(patient);
      patientIds.push(patientId);
    }
    
    // 의사 데이터 생성
    const doctorIds = [];
    for (const doctor of dummyDoctors) {
      const doctorId = await createUserIfNotExists(doctor);
      doctorIds.push(doctorId);
    }
    
    // 각 환자별로 2-5개의 EMR 데이터 생성
    for (const patientId of patientIds) {
      const emrCount = 2 + Math.floor(Math.random() * 4); // 2-5개
      
      for (let i = 0; i < emrCount; i++) {
        // 랜덤 의사 선택
        const doctorId = doctorIds[Math.floor(Math.random() * doctorIds.length)];
        
        // EMR 데이터 생성 및 삽입
        const emrData = getRandomEmr(patientId, doctorId);
        await insertEmr(emrData);
      }
    }
    
    console.log('더미 데이터 삽입 완료!');
    console.log(`총 ${patientIds.length}명의 환자와 ${doctorIds.length}명의 의사 데이터 생성`);
  } catch (error) {
    console.error('더미 데이터 삽입 중 오류 발생:', error);
  } finally {
    // 연결 종료
    process.exit(0);
  }
}

// 스크립트 실행
insertDummyData();

module.exports = { createEmrTable, insertDummyData }; 