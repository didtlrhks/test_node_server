const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+09:00', // 한국 시간대 설정 (UTC+9)
});

// promise 래퍼를 사용하여 async/await 지원
const promisePool = pool.promise();

module.exports = promisePool; 