const db = require('../config/db');

// 테이블을 삭제하고 다시 생성하는 스크립트
async function dropAndCreateTables() {
  try {
    console.log('테이블 삭제 및 재생성 시작...');
    
    // 외래 키 제약 조건 비활성화
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 관련 테이블 삭제
    const tablesToDrop = ['users', 'emr_data'];
    
    for (const table of tablesToDrop) {
      try {
        await db.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`${table} 테이블이 삭제되었습니다.`);
      } catch (error) {
        console.log(`${table} 테이블 삭제 중 오류 (무시됨): ${error.message}`);
      }
    }
    
    // 외래 키 제약 조건 다시 활성화
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // EMR 데이터 테이블 생성 (먼저 생성해야 외래 키 참조 가능)
    console.log('EMR 데이터 테이블 생성 중...');
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
    
    // Users 테이블 생성
    console.log('Users 테이블 생성 중...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        patient_id VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES emr_data(patient_id) ON DELETE SET NULL
      )
    `);
    console.log('Users 테이블이 생성되었습니다.');
    
    console.log('테이블 삭제 및 재생성 완료!');
  } catch (error) {
    console.error('테이블 삭제 및 재생성 중 오류 발생:', error);
  } finally {
    // 외래 키 제약 조건 다시 활성화 (오류 발생 시에도)
    try {
      await db.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      console.error('외래 키 제약 조건 활성화 중 오류:', e);
    }
    
    // 연결 종료
    process.exit(0);
  }
}

// 스크립트 실행
dropAndCreateTables(); 