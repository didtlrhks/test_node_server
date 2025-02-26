const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 라우트
app.use('/api/users', userRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('사용자 관리 API에 오신 것을 환영합니다! API 문서는 <a href="/api-docs">여기</a>에서 확인하세요.');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`Swagger 문서는 http://localhost:${PORT}/api-docs 에서 확인할 수 있습니다.`);
}); 