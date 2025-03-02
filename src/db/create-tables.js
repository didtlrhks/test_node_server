const db = require('../config/db');

async function createTables() {
  try {
    // EMR 데이터 테이블
    await db.query(`
      CREATE TABLE IF NOT EXISTS emr_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_name VARCHAR(100) NOT NULL,
        patient_id VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        birth_date DATE,
        gender VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('EMR 데이터 테이블이 생성되었습니다.');

    // 인증 코드 테이블
    await db.query(`
      CREATE TABLE IF NOT EXISTS auth_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id VARCHAR(50) NOT NULL,
        auth_code VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (patient_id) REFERENCES emr_data(patient_id)
      )
    `);
    console.log('인증 코드 테이블이 생성되었습니다.');

    // 검증된 코드 테이블
    await db.query(`
      CREATE TABLE IF NOT EXISTS verified_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id VARCHAR(50) NOT NULL,
        auth_code VARCHAR(10) NOT NULL,
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES emr_data(patient_id)
      )
    `);
    console.log('검증된 코드 테이블이 생성되었습니다.');

    // 사용자 관리 테이블
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_management (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id VARCHAR(50) NOT NULL UNIQUE,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        FOREIGN KEY (patient_id) REFERENCES emr_data(patient_id)
      )
    `);
    console.log('사용자 관리 테이블이 생성되었습니다.');

  } catch (error) {
    console.error('테이블 생성 오류:', error);
  } finally {
    process.exit(0);
  }
}

// 함수 실행
createTables(); 