const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/api/users', userRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('사용자 관리 API에 오신 것을 환영합니다!');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 