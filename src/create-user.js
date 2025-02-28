const db = require('./config/db');

async function createUser(username, email, password) {
  try {
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    
    console.log('사용자가 성공적으로 생성되었습니다:', {
      id: result.insertId,
      username,
      email
    });
    
    return result.insertId;
  } catch (error) {
    console.error('사용자 생성 오류:', error);
    throw error;
  }
}

// 테스트 사용자 생성
if (require.main === module) {
  const testUser = {
    username: 'test_user',
    email: 'test@example.com',
    password: 'password123'
  };
  
  createUser(testUser.username, testUser.email, testUser.password)
    .then(() => {
      console.log('테스트 완료');
      process.exit(0);
    })
    .catch(() => {
      console.log('테스트 실패');
      process.exit(1);
    });
}

module.exports = { createUser }; 