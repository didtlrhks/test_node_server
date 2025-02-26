const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '사용자 관리 API',
      version: '1.0.0',
      description: 'MySQL을 사용한 사용자 관리 API 문서',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버',
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')], // 절대 경로로 수정
};

const specs = swaggerJsdoc(options);

module.exports = specs; 