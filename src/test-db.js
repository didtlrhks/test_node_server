const db = require('./config/db');

async function testDatabaseConnection() {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    console.log('데이터베이스 연결 성공:', rows);
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
  } finally {
    process.exit(0);
  }
}

testDatabaseConnection();

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
  } catch (error) {
    console.error('Users 테이블 생성 오류:', error);
  }
}

// 함수 실행
createUsersTable(); 