const db = require('../config/db');

// EMR 데이터 테이블 초기화 및 AUTO_INCREMENT 리셋 스크립트

async function resetEmrDataTable() {
  try {
    console.log('EMR 데이터 테이블 초기화 시작...');
    
    // 테이블 존재 여부 확인
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'emr_data'
    `, [process.env.DB_NAME]);
    
    if (tables.length === 0) {
      console.log('EMR 데이터 테이블이 존재하지 않습니다.');
      return;
    }
    
    // 외래 키 제약 조건 비활성화
    console.log('외래 키 제약 조건 비활성화...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 관련 테이블 초기화
    console.log('관련 테이블 초기화 중...');
    
    try {
      // 1. auth_codes 테이블 초기화
      await db.query('TRUNCATE TABLE auth_codes');
      console.log('auth_codes 테이블이 초기화되었습니다.');
    } catch (error) {
      console.log('auth_codes 테이블 초기화 중 오류 (무시됨):', error.message);
    }
    
    try {
      // 2. verified_codes 테이블 초기화
      await db.query('TRUNCATE TABLE verified_codes');
      console.log('verified_codes 테이블이 초기화되었습니다.');
    } catch (error) {
      console.log('verified_codes 테이블 초기화 중 오류 (무시됨):', error.message);
    }
    
    try {
      // 3. user_management 테이블 초기화
      await db.query('TRUNCATE TABLE user_management');
      console.log('user_management 테이블이 초기화되었습니다.');
    } catch (error) {
      console.log('user_management 테이블 초기화 중 오류 (무시됨):', error.message);
    }
    
    // 4. EMR 데이터 테이블 초기화
    await db.query('TRUNCATE TABLE emr_data');
    console.log('EMR 데이터 테이블이 초기화되었습니다.');
    
    // AUTO_INCREMENT 값 확인
    const [autoIncrement] = await db.query(`
      SELECT AUTO_INCREMENT
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'emr_data'
    `, [process.env.DB_NAME]);
    
    console.log(`현재 AUTO_INCREMENT 값: ${autoIncrement[0]?.AUTO_INCREMENT || 'N/A'}`);
    
    // AUTO_INCREMENT 값 리셋 (필요한 경우)
    if (autoIncrement[0]?.AUTO_INCREMENT > 1) {
      await db.query('ALTER TABLE emr_data AUTO_INCREMENT = 1');
      console.log('AUTO_INCREMENT 값이 1로 리셋되었습니다.');
    }
    
    // 외래 키 제약 조건 다시 활성화
    console.log('외래 키 제약 조건 다시 활성화...');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('EMR 데이터 테이블 초기화 완료!');
  } catch (error) {
    console.error('EMR 데이터 테이블 초기화 중 오류 발생:', error);
    
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
resetEmrDataTable(); 