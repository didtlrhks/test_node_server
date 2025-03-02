// const db = require('../config/db');

// // EMR 더미 데이터 생성 및 삽입 스크립트
// // 실제 외부 서버에서 EMR 데이터를 받는 것을 시뮬레이션합니다.

// // EMR 데이터 테이블 생성 함수
// async function createEmrDataTable() {
//   try {
//     await db.query(`
//       CREATE TABLE IF NOT EXISTS emr_data (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         patient_name VARCHAR(100) NOT NULL,
//         patient_id VARCHAR(50) NOT NULL UNIQUE,
//         email VARCHAR(100) NOT NULL,
//         phone VARCHAR(20),
//         birth_date DATE,
//         gender VARCHAR(10),
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);
//     console.log('EMR 데이터 테이블이 생성되었습니다.');
//   } catch (error) {
//     console.error('EMR 데이터 테이블 생성 오류:', error);
//     throw error;
//   }
// }

// // 더미 EMR 데이터
// const dummyEmrData = [
//   {
//     patient_name: '김환자',
//     patient_id: 'P12345',
//     email: 'patient1@example.com',
//     phone: '010-1234-5678',
//     birth_date: '1980-05-15',
//     gender: '남성'
//   },
//   {
//     patient_name: '이환자',
//     patient_id: 'P23456',
//     email: 'patient2@example.com',
//     phone: '010-2345-6789',
//     birth_date: '1992-08-20',
//     gender: '여성'
//   },
//   {
//     patient_name: '박환자',
//     patient_id: 'P34567',
//     email: 'patient3@example.com',
//     phone: '010-3456-7890',
//     birth_date: '1975-12-10',
//     gender: '남성'
//   },
//   {
//     patient_name: '최환자',
//     patient_id: 'P45678',
//     email: 'patient4@example.com',
//     phone: '010-4567-8901',
//     birth_date: '1988-03-25',
//     gender: '여성'
//   },
//   {
//     patient_name: '정환자',
//     patient_id: 'P56789',
//     email: 'patient5@example.com',
//     phone: '010-5678-9012',
//     birth_date: '1965-07-30',
//     gender: '남성'
//   }
// ];

// // EMR 데이터 삽입 함수
// async function insertEmrData(data) {
//   try {
//     const [result] = await db.execute(
//       `INSERT INTO emr_data 
//        (patient_name, patient_id, email, phone, birth_date, gender) 
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [
//         data.patient_name,
//         data.patient_id,
//         data.email,
//         data.phone,
//         data.birth_date,
//         data.gender
//       ]
//     );
    
//     console.log(`EMR 데이터 삽입 완료 (ID: ${result.insertId}, 환자: ${data.patient_name})`);
//     return result.insertId;
//   } catch (error) {
//     console.error(`EMR 데이터 삽입 오류 (환자: ${data.patient_name}):`, error);
//     throw error;
//   }
// }

// // 메인 함수
// async function insertDummyEmrData() {
//   try {
//     console.log('EMR 더미 데이터 삽입 시작...');
    
//     // EMR 데이터 테이블 생성
//     await createEmrDataTable();
    
//     // 더미 데이터 삽입
//     for (const data of dummyEmrData) {
//       try {
//         await insertEmrData(data);
//       } catch (error) {
//         // 중복 키 오류 등은 무시하고 계속 진행
//         if (error.code === 'ER_DUP_ENTRY') {
//           console.log(`환자 ID ${data.patient_id}는 이미 존재합니다. 건너뜁니다.`);
//         } else {
//           throw error;
//         }
//       }
//     }
    
//     console.log('EMR 더미 데이터 삽입 완료!');
//     console.log(`총 ${dummyEmrData.length}명의 환자 데이터 생성 시도 완료`);
//   } catch (error) {
//     console.error('EMR 더미 데이터 삽입 중 오류 발생:', error);
//   } finally {
//     // 연결 종료
//     process.exit(0);
//   }
// }

// // 스크립트 실행
// insertDummyEmrData();

// module.exports = { createEmrDataTable, insertDummyEmrData }; 