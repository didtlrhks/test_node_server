const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '사용자 API',
      version: '1.0.0',
      description: '사용자 관리를 위한 API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // API 라우트 파일 경로
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 기본 라우트
app.get('/', (req, res) => {
  res.send('서버가 실행 중입니다!');
});

// 데이터베이스 연결 테스트
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    res.json({ message: '데이터베이스 연결 성공', data: rows });
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
    res.status(500).json({ error: '데이터베이스 연결 실패' });
  }
});

// 라우터 가져오기
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const emrRouter = require('./routes/emr');

// 라우터 설정
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/emr', emrRouter);

// 데이터베이스 테이블 확인 함수
async function checkAndCreateTables() {
  try {
    // EMR 테이블 존재 여부 확인
    const [emrTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'emr'
    `, [process.env.DB_NAME]);
    
    if (emrTables.length === 0) {
      console.log('EMR 테이블이 존재하지 않습니다. 테이블을 생성합니다...');
      
      // EMR 테이블 생성
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
    } else {
      console.log('EMR 테이블이 이미 존재합니다.');
    }
    
    // EMR 데이터 테이블 존재 여부 확인
    const [emrDataTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'emr_data'
    `, [process.env.DB_NAME]);
    
    if (emrDataTables.length === 0) {
      console.log('EMR 데이터 테이블이 존재하지 않습니다. 테이블을 생성합니다...');
      
      // EMR 데이터 테이블 생성
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
    } else {
      console.log('EMR 데이터 테이블이 이미 존재합니다.');
    }
    
    // 인증 코드 테이블 존재 여부 확인
    const [authCodeTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'auth_codes'
    `, [process.env.DB_NAME]);
    
    if (authCodeTables.length === 0) {
      console.log('인증 코드 테이블이 존재하지 않습니다. 테이블을 생성합니다...');
      
      // 인증 코드 테이블 생성
      await db.query(`
        CREATE TABLE IF NOT EXISTS auth_codes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id VARCHAR(50) NOT NULL,
          auth_code VARCHAR(10) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          is_used BOOLEAN DEFAULT FALSE
        )
      `);
      console.log('인증 코드 테이블이 생성되었습니다.');
    } else {
      console.log('인증 코드 테이블이 이미 존재합니다.');
    }
    
    // 검증된 코드 테이블 존재 여부 확인
    const [verifiedCodeTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'verified_codes'
    `, [process.env.DB_NAME]);
    
    if (verifiedCodeTables.length === 0) {
      console.log('검증된 코드 테이블이 존재하지 않습니다. 테이블을 생성합니다...');
      
      // 검증된 코드 테이블 생성
      await db.query(`
        CREATE TABLE IF NOT EXISTS verified_codes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id VARCHAR(50) NOT NULL,
          auth_code VARCHAR(10) NOT NULL,
          verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('검증된 코드 테이블이 생성되었습니다.');
    } else {
      console.log('검증된 코드 테이블이 이미 존재합니다.');
    }
    
    // 사용자 관리 테이블 존재 여부 확인
    const [userManagementTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_management'
    `, [process.env.DB_NAME]);
    
    if (userManagementTables.length === 0) {
      console.log('사용자 관리 테이블이 존재하지 않습니다. 테이블을 생성합니다...');
      
      // 사용자 관리 테이블 생성
      await db.query(`
        CREATE TABLE IF NOT EXISTS user_management (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id VARCHAR(50) NOT NULL UNIQUE,
          last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(20) DEFAULT 'active'
        )
      `);
      console.log('사용자 관리 테이블이 생성되었습니다.');
    } else {
      console.log('사용자 관리 테이블이 이미 존재합니다.');
    }
  } catch (error) {
    console.error('데이터베이스 테이블 확인 중 오류:', error);
  }
}

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  
  // 서버 시작 시 데이터베이스 테이블 확인
  await checkAndCreateTables();
}); 