const db = require('../config/db');

// users 테이블 생성
async function createUsersTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users 테이블이 생성되었습니다.');
    return true;
  } catch (error) {
    console.error('Users 테이블 생성 오류:', error);
    return false;
  }
}

// EMR 테이블 생성
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
    return true;
  } catch (error) {
    console.error('EMR 테이블 생성 오류:', error);
    return false;
  }
}

// 모든 함수를 순차적으로 실행하는 메인 함수
async function initializeDatabase() {
  try {
    console.log('데이터베이스 초기화를 시작합니다...');
    
    await createUsersTable();
    await createEmrTable();
    
    console.log('데이터베이스 초기화가 완료되었습니다.');
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

// 메인 함수 실행
initializeDatabase(); 