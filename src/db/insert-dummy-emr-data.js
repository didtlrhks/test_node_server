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
    birth_date: '1980-05-15',
    gender: '남성',
    
    // 간기능 검사
    ast: 25.3,
    alt: 22.1,
    ggt: 35.7,
    
    // 진료 및 처방 기록
    medical_record: '고혈압 진단. 정기적인 혈압 모니터링 필요. 식이요법 및 운동 권장.',
    prescription_record: '아모디핀 5mg 1일 1회 아침 식후',
    
    // 신체 측정
    waist_circumference: 85.5,
    bmi: 24.3,
    
    // 혈당 관련
    glucose: 95,
    hba1c: 5.6,
    
    // 지질 관련
    triglyceride: 150,
    ldl: 130,
    hdl: 45,
    
    // 기타 검사
    uric_acid: 5.8,
    
    // 혈압
    sbp: 135,
    dbp: 85,
    
    // 신장 기능
    gfr: 85,
    
    // 혈액 검사
    plt: 250
  },
  {
    patient_name: '이환자',
    patient_id: 'P23456',
    email: 'patient2@example.com',
    phone: '010-2345-6789',
    birth_date: '1992-08-20',
    gender: '여성',
    
    // 간기능 검사
    ast: 18.5,
    alt: 15.2,
    ggt: 22.3,
    
    // 진료 및 처방 기록
    medical_record: '건강검진 결과 특이사항 없음. 정상 범위 내 수치 확인.',
    prescription_record: '처방 없음',
    
    // 신체 측정
    waist_circumference: 68.2,
    bmi: 21.5,
    
    // 혈당 관련
    glucose: 85,
    hba1c: 5.2,
    
    // 지질 관련
    triglyceride: 95,
    ldl: 110,
    hdl: 65,
    
    // 기타 검사
    uric_acid: 4.2,
    
    // 혈압
    sbp: 115,
    dbp: 75,
    
    // 신장 기능
    gfr: 95,
    
    // 혈액 검사
    plt: 280
  },
  {
    patient_name: '박환자',
    patient_id: 'P34567',
    email: 'patient3@example.com',
    phone: '010-3456-7890',
    birth_date: '1975-12-10',
    gender: '남성',
    
    // 간기능 검사
    ast: 45.2,
    alt: 52.8,
    ggt: 75.3,
    
    // 진료 및 처방 기록
    medical_record: '경도의 지방간 진단. 알코올 섭취 제한 및 체중 감량 권고.',
    prescription_record: '우르소데옥시콜산 300mg 1일 3회 식후',
    
    // 신체 측정
    waist_circumference: 92.5,
    bmi: 27.8,
    
    // 혈당 관련
    glucose: 110,
    hba1c: 6.1,
    
    // 지질 관련
    triglyceride: 220,
    ldl: 155,
    hdl: 38,
    
    // 기타 검사
    uric_acid: 7.2,
    
    // 혈압
    sbp: 145,
    dbp: 90,
    
    // 신장 기능
    gfr: 75,
    
    // 혈액 검사
    plt: 230
  },
  {
    patient_name: '최환자',
    patient_id: 'P45678',
    email: 'patient4@example.com',
    phone: '010-4567-8901',
    birth_date: '1988-03-25',
    gender: '여성',
    
    // 간기능 검사
    ast: 22.1,
    alt: 19.8,
    ggt: 28.5,
    
    // 진료 및 처방 기록
    medical_record: '갑상선 기능 저하증 진단. 정기적인 호르몬 수치 모니터링 필요.',
    prescription_record: '레보티록신 50mcg 1일 1회 아침 식전',
    
    // 신체 측정
    waist_circumference: 72.5,
    bmi: 23.1,
    
    // 혈당 관련
    glucose: 92,
    hba1c: 5.4,
    
    // 지질 관련
    triglyceride: 120,
    ldl: 125,
    hdl: 55,
    
    // 기타 검사
    uric_acid: 4.8,
    
    // 혈압
    sbp: 120,
    dbp: 80,
    
    // 신장 기능
    gfr: 90,
    
    // 혈액 검사
    plt: 310
  },
  {
    patient_name: '정환자',
    patient_id: 'P56789',
    email: 'patient5@example.com',
    phone: '010-5678-9012',
    birth_date: '1965-07-30',
    gender: '남성',
    
    // 간기능 검사
    ast: 32.5,
    alt: 35.2,
    ggt: 45.8,
    
    // 진료 및 처방 기록
    medical_record: '제2형 당뇨병 진단. 식이요법 및 운동 권장. 정기적인 혈당 모니터링 필요.',
    prescription_record: '메트포르민 500mg 1일 2회 식후, 글리메피리드 2mg 1일 1회 아침 식전',
    
    // 신체 측정
    waist_circumference: 95.5,
    bmi: 28.5,
    
    // 혈당 관련
    glucose: 145,
    hba1c: 7.2,
    
    // 지질 관련
    triglyceride: 180,
    ldl: 145,
    hdl: 40,
    
    // 기타 검사
    uric_acid: 6.5,
    
    // 혈압
    sbp: 140,
    dbp: 88,
    
    // 신장 기능
    gfr: 70,
    
    // 혈액 검사
    plt: 220
  },
  {
    patient_name: '양시관',
    patient_id: 'P67890',
    email: 'patient6@example.com',
    phone: '010-6789-0123',
    birth_date: '1970-11-15',
    gender: '남성',
    
    // 간기능 검사
    ast: 28.3,
    alt: 30.1,
    ggt: 42.7,
    
    // 진료 및 처방 기록
    medical_record: '고지혈증 진단. 식이요법 및 운동 권장. 정기적인 지질 수치 모니터링 필요.',
    prescription_record: '아토르바스타틴 10mg 1일 1회 저녁 식후',
    
    // 신체 측정
    waist_circumference: 88.5,
    bmi: 25.8,
    
    // 혈당 관련
    glucose: 105,
    hba1c: 5.9,
    
    // 지질 관련
    triglyceride: 190,
    ldl: 160,
    hdl: 42,
    
    // 기타 검사
    uric_acid: 6.2,
    
    // 혈압
    sbp: 130,
    dbp: 82,
    
    // 신장 기능
    gfr: 80,
    
    // 혈액 검사
    plt: 240
  },
  {
    patient_name: '홍길동',
    patient_id: 'P78901',
    email: 'patient7@example.com',
    phone: '010-7890-1234',
    birth_date: '1985-04-12',
    gender: '남성',
    
    // 간기능 검사
    ast: 24.8,
    alt: 26.2,
    ggt: 38.5,
    
    // 진료 및 처방 기록
    medical_record: '경도의 불안장애 진단. 스트레스 관리 및 규칙적인 생활 권장.',
    prescription_record: '알프라졸람 0.25mg 필요시 복용',
    
    // 신체 측정
    waist_circumference: 83.2,
    bmi: 23.9,
    
    // 혈당 관련
    glucose: 98,
    hba1c: 5.5,
    
    // 지질 관련
    triglyceride: 130,
    ldl: 125,
    hdl: 48,
    
    // 기타 검사
    uric_acid: 5.5,
    
    // 혈압
    sbp: 125,
    dbp: 78,
    
    // 신장 기능
    gfr: 88,
    
    // 혈액 검사
    plt: 260
  },
  {
    patient_name: '김영희',
    patient_id: 'P89012',
    email: 'patient8@example.com',
    phone: '010-8901-2345',
    birth_date: '1990-09-28',
    gender: '여성',
    
    // 간기능 검사
    ast: 20.5,
    alt: 18.2,
    ggt: 25.3,
    
    // 진료 및 처방 기록
    medical_record: '철결핍성 빈혈 진단. 철분 보충 및 균형 잡힌 식이 권장.',
    prescription_record: '철분제 100mg 1일 1회 식후',
    
    // 신체 측정
    waist_circumference: 70.5,
    bmi: 22.1,
    
    // 혈당 관련
    glucose: 88,
    hba1c: 5.3,
    
    // 지질 관련
    triglyceride: 105,
    ldl: 115,
    hdl: 60,
    
    // 기타 검사
    uric_acid: 4.5,
    
    // 혈압
    sbp: 118,
    dbp: 75,
    
    // 신장 기능
    gfr: 92,
    
    // 혈액 검사
    plt: 290
  },
  {
    patient_name: '손동희',
    patient_id: 'P90123',
    email: 'patient9@example.com',
    phone: '010-9012-3456',
    birth_date: '1995-11-18',
    gender: '남성',
    
    // 간기능 검사
    ast: 22.3,
    alt: 20.8,
    ggt: 30.2,
    
    // 진료 및 처방 기록
    medical_record: '알레르기성 비염 진단. 알레르겐 회피 및 증상 관리 교육.',
    prescription_record: '세티리진 10mg 1일 1회 취침 전, 플루티카손 비강 스프레이 1일 2회',
    
    // 신체 측정
    waist_circumference: 78.5,
    bmi: 22.8,
    
    // 혈당 관련
    glucose: 90,
    hba1c: 5.2,
    
    // 지질 관련
    triglyceride: 110,
    ldl: 120,
    hdl: 52,
    
    // 기타 검사
    uric_acid: 5.0,
    
    // 혈압
    sbp: 122,
    dbp: 76,
    
    // 신장 기능
    gfr: 95,
    
    // 혈액 검사
    plt: 270
  }
];

// EMR 데이터 삽입 함수
async function insertEmrData(data) {
  try {
    const [result] = await db.execute(
      `INSERT INTO emr_data 
       (patient_name, patient_id, email, phone, birth_date, gender, 
        ast, alt, ggt, medical_record, prescription_record, waist_circumference, 
        bmi, glucose, hba1c, triglyceride, ldl, hdl, uric_acid, 
        sbp, dbp, gfr, plt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        data.medical_record,
        data.prescription_record,
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