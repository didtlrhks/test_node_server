const db = require('./config/db');

async function testDatabaseConnection() {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    console.log('데이터베이스 연결 성공:', rows);
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
    return false;
  }
}

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
  const isConnected = await testDatabaseConnection();
  
  if (isConnected) {
    await createUsersTable();
    await createEmrTable();
    console.log('데이터베이스 초기화가 완료되었습니다.');
  }
  
  // 모든 작업이 완료된 후 종료
  process.exit(0);
}

// 메인 함수 실행
initializeDatabase(); 
createEmrTable(); 