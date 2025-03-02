const db = require('../config/db');

// 모든 테이블의 데이터를 삭제하고 AUTO_INCREMENT를 리셋하는 스크립트

async function cleanAllData() {
  try {
    console.log('모든 테이블 데이터 삭제 시작...');
    
    // 외래 키 제약 조건 비활성화
    console.log('외래 키 제약 조건 비활성화...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 테이블 목록 조회
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);
    
    // 각 테이블 데이터 삭제 및 AUTO_INCREMENT 리셋
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      try {
        // 테이블 데이터 삭제
        await db.query(`DELETE FROM ${tableName}`);
        console.log(`${tableName} 테이블의 데이터가 삭제되었습니다.`);
        
        // AUTO_INCREMENT 리셋 (해당 테이블에 AUTO_INCREMENT 컬럼이 있는 경우)
        try {
          await db.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
          console.log(`${tableName} 테이블의 AUTO_INCREMENT가 1로 리셋되었습니다.`);
        } catch (error) {
          // AUTO_INCREMENT가 없는 테이블은 무시
          console.log(`${tableName} 테이블에는 AUTO_INCREMENT가 없거나 리셋할 수 없습니다.`);
        }
      } catch (error) {
        console.error(`${tableName} 테이블 처리 중 오류:`, error.message);
      }
    }
    
    // 외래 키 제약 조건 다시 활성화
    console.log('외래 키 제약 조건 다시 활성화...');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('모든 테이블 데이터 삭제 및 AUTO_INCREMENT 리셋 완료!');
  } catch (error) {
    console.error('데이터 삭제 중 오류 발생:', error);
    
    // 오류가 발생해도 외래 키 제약 조건은 다시 활성화
    try {
      await db.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      console.error('외래 키 제약 조건 활성화 중 오류:', e);
    }
  } finally {
    // 연결 종료
    process.exit(0);
  }
}

// 스크립트 실행
cleanAllData(); 