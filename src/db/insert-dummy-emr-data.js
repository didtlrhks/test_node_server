const db = require('../config/db');

// EMR 더미 데이터 생성 및 삽입 스크립트
// 실제 외부 서버에서 EMR 데이터를 받는 것을 시뮬레이션합니다.

// EMR 데이터 테이블 생성 함수
async function createEmrDataTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS emr_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_name VARCHAR(100) NOT NULL,
        patient_id VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        birth_date DATE,
        gender VARCHAR(10),
        
        /* 간기능 검사 */
        ast FLOAT,
        alt FLOAT,
        ggt FLOAT,
        
        /* 진료 및 처방 기록 */
        medical_record TEXT,
        prescription_record TEXT,
        
        /* 신체 측정 */
        waist_circumference FLOAT,  /* 허리둘레 (cm) */
        bmi FLOAT,                  /* 체질량지수 */
        
        /* 혈당 관련 */
        glucose FLOAT,              /* 혈당수치 (mg/dL) */
        hba1c FLOAT,                /* 당화혈색소 (%) */
        
        /* 지질 관련 */
        triglyceride FLOAT,         /* 중성지방 (mg/dL) */
        ldl FLOAT,                  /* LDL 콜레스테롤 (mg/dL) */
        hdl FLOAT,                  /* HDL 콜레스테롤 (mg/dL) */
        
        /* 기타 검사 */
        uric_acid FLOAT,            /* 요산수치 (mg/dL) */
        
        /* 혈압 */
        sbp INT,                    /* 수축기 혈압 (mmHg) */
        dbp INT,                    /* 이완기 혈압 (mmHg) */
        
        /* 신장 기능 */
        gfr FLOAT,                  /* 측정사구체여과율 (mL/min/1.73m²) */
        
        /* 혈액 검사 */
        plt INT,                    /* 혈소판 (10³/μL) */
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('EMR 데이터 테이블이 생성되었습니다.');
  } catch (error) {
    console.error('EMR 데이터 테이블 생성 오류:', error);
    throw error;
  }
}

// 더미 EMR 데이터
const dummyEmrData = [
  {
    patient_name: '김환자',
    patient_id: 'P12345',
    email: 'patient1@example.com',
    phone: '010-1234-5678',
    birth_date: '1980-01-15',
    gender: 'M',
    ast: 35,
    alt: 40,
    ggt: 45,
    albumin: 4.2,
    medical_record: '고혈압 진단, 약물 치료 중',
    prescription_record: '아스피린 100mg 1일 1회',
    weight: 75.5,
    waist_circumference: 85,
    bmi: 24.8,
    glucose: 110,
    hba1c: 5.8,
    triglyceride: 150,
    ldl: 130,
    hdl: 45,
    uric_acid: 5.5,
    sbp: 135,
    dbp: 85,
    gfr: 90,
    plt: 250
  },
  {
    patient_name: '이환자',
    patient_id: 'P23456',
    email: 'patient2@example.com',
    phone: '010-2345-6789',
    birth_date: '1975-05-20',
    gender: 'F',
    ast: 28,
    alt: 32,
    ggt: 30,
    albumin: 4.0,
    medical_record: '당뇨병 진단, 식이요법 중',
    prescription_record: '메트포르민 500mg 1일 2회',
    weight: 62.0,
    waist_circumference: 78,
    bmi: 23.5,
    glucose: 130,
    hba1c: 6.7,
    triglyceride: 180,
    ldl: 140,
    hdl: 40,
    uric_acid: 4.8,
    sbp: 125,
    dbp: 80,
    gfr: 85,
    plt: 220
  },
  {
    patient_name: '박환자',
    patient_id: 'P34567',
    email: 'patient3@example.com',
    phone: '010-3456-7890',
    birth_date: '1990-10-10',
    gender: 'M',
    ast: 22,
    alt: 25,
    ggt: 20,
    albumin: 4.5,
    medical_record: '건강 검진 결과 정상',
    prescription_record: '없음',
    weight: 68.2,
    waist_circumference: 75,
    bmi: 22.1,
    glucose: 95,
    hba1c: 5.2,
    triglyceride: 120,
    ldl: 110,
    hdl: 55,
    uric_acid: 4.2,
    sbp: 120,
    dbp: 75,
    gfr: 95,
    plt: 280
  },
  {
    patient_name: '최환자',
    patient_id: 'P45678',
    email: 'patient4@example.com',
    phone: '010-4567-8901',
    birth_date: '1985-03-25',
    gender: 'F',
    ast: 45,
    alt: 50,
    ggt: 55,
    albumin: 3.8,
    medical_record: '지방간 진단, 식이요법 중',
    prescription_record: '우르소데옥시콜산 300mg 1일 3회',
    weight: 80.0,
    waist_circumference: 92,
    bmi: 27.5,
    glucose: 105,
    hba1c: 5.5,
    triglyceride: 200,
    ldl: 150,
    hdl: 35,
    uric_acid: 6.0,
    sbp: 130,
    dbp: 85,
    gfr: 80,
    plt: 210
  },
  {
    patient_name: '정환자',
    patient_id: 'P56789',
    email: 'patient5@example.com',
    phone: '010-5678-9012',
    birth_date: '1970-12-05',
    gender: 'M',
    ast: 60,
    alt: 65,
    ggt: 70,
    albumin: 3.5,
    medical_record: '간경변 진단, 약물 치료 중',
    prescription_record: '라니티딘 150mg 1일 2회',
    weight: 72.8,
    waist_circumference: 88,
    bmi: 26.2,
    glucose: 120,
    hba1c: 6.0,
    triglyceride: 170,
    ldl: 145,
    hdl: 38,
    uric_acid: 5.8,
    sbp: 140,
    dbp: 90,
    gfr: 75,
    plt: 180
  },
  {
    patient_name: '양시관',
    patient_id: 'P67890',
    email: 'patient6@example.com',
    phone: '010-6789-0123',
    birth_date: '1988-07-15',
    gender: 'M',
    ast: 30,
    alt: 35,
    ggt: 25,
    albumin: 4.3,
    medical_record: '경미한 지방간 진단, 생활습관 개선 중',
    prescription_record: '없음',
    weight: 78.5,
    waist_circumference: 84,
    bmi: 25.0,
    glucose: 100,
    hba1c: 5.4,
    triglyceride: 160,
    ldl: 125,
    hdl: 48,
    uric_acid: 5.2,
    sbp: 125,
    dbp: 80,
    gfr: 90,
    plt: 260
  },
  {
    patient_name: '홍길동',
    patient_id: 'P78901',
    email: 'patient7@example.com',
    phone: '010-7890-1234',
    birth_date: '1982-09-20',
    gender: 'M',
    ast: 25,
    alt: 30,
    ggt: 22,
    albumin: 4.4,
    medical_record: '건강 검진 결과 정상',
    prescription_record: '없음',
    weight: 70.0,
    waist_circumference: 80,
    bmi: 23.0,
    glucose: 98,
    hba1c: 5.3,
    triglyceride: 130,
    ldl: 120,
    hdl: 50,
    uric_acid: 4.5,
    sbp: 120,
    dbp: 75,
    gfr: 92,
    plt: 270
  }
];

// EMR 데이터 삽입 함수
async function insertEmrData(data) {
  try {
    const [result] = await db.execute(
      `INSERT INTO emr_data 
       (patient_name, patient_id, email, phone, birth_date, gender, 
        ast, alt, ggt, albumin, medical_record, prescription_record,
        weight, waist_circumference, bmi, glucose, hba1c,
        triglyceride, ldl, hdl, uric_acid, sbp, dbp, gfr, plt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.patient_name,
        data.patient_id,
        data.email,
        data.phone,
        data.birth_date,
        data.gender,
        data.ast,
        data.alt,
        data.ggt,
        data.albumin,
        data.medical_record,
        data.prescription_record,
        data.weight,
        data.waist_circumference,
        data.bmi,
        data.glucose,
        data.hba1c,
        data.triglyceride,
        data.ldl,
        data.hdl,
        data.uric_acid,
        data.sbp,
        data.dbp,
        data.gfr,
        data.plt
      ]
    );
    
    console.log(`EMR 데이터 삽입 완료 (ID: ${result.insertId}, 환자: ${data.patient_name})`);
    return result.insertId;
  } catch (error) {
    console.error(`EMR 데이터 삽입 오류 (환자: ${data.patient_name}):`, error);
    throw error;
  }
}

// 메인 함수
async function insertDummyEmrData() {
  try {
    console.log('EMR 더미 데이터 삽입 시작...');
    
    // EMR 데이터 테이블 생성
    await createEmrDataTable();
    
    // 더미 데이터 삽입
    for (const data of dummyEmrData) {
      try {
        await insertEmrData(data);
      } catch (error) {
        // 중복 키 오류 등은 무시하고 계속 진행
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`환자 ID ${data.patient_id}는 이미 존재합니다. 건너뜁니다.`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('EMR 더미 데이터 삽입 완료!');
    console.log(`총 ${dummyEmrData.length}명의 환자 데이터 생성 시도 완료`);
  } catch (error) {
    console.error('EMR 더미 데이터 삽입 중 오류 발생:', error);
  } finally {
    // 연결 종료
    process.exit(0);
  }
}

// 스크립트 실행
insertDummyEmrData();

module.exports = { createEmrDataTable, insertDummyEmrData }; 