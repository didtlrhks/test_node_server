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
const emrRouter = require('./routes/emr');
const exerciseRouter = require('./routes/exercise');
const lunchRouter = require('./routes/lunch');
const breakfastRouter = require('./routes/breakfast');

// 라우터 설정
app.use('/api/users', usersRouter);
app.use('/api/emr', emrRouter);
app.use('/api/exercise', exerciseRouter);
app.use('/api/lunch', lunchRouter);
app.use('/api/breakfast', breakfastRouter);

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 