// Firebase Custom Token 생성 서버
// 사용법: node server.js

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin SDK 초기화
// serviceAccountKey.json 파일을 env 폴더에 넣어주세요
const serviceAccount = require('./env/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('Firebase Admin SDK 초기화 완료');

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Token server is running' });
});

// 토큰 생성 엔드포인트 (API 키 기반)
app.post('/api/generate-token', async (req, res) => {
  try {
    const { userId, apiKey } = req.body;
    
    if (!userId || !apiKey) {
      return res.status(400).json({ 
        error: 'userId와 apiKey가 필요합니다.' 
      });
    }
    
    // API 키 검증 (실제로는 DB에서 확인해야 함)
    // env/config.js의 ADMIN 설정과 일치하도록 설정
    const validApiKeys = process.env.ADMIN_API_KEYS 
      ? process.env.ADMIN_API_KEYS.split(',')
      : ['admin1234']; // 기본값 (실제 운영 시 변경 필요)
    
    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({ 
        error: '유효하지 않은 API 키입니다.' 
      });
    }
    
    // Custom Claims 설정 (사용자 역할 등)
    const customClaims = {
      role: 'admin',
      apiKey: apiKey
    };
    
    // Custom Token 생성
    const customToken = await admin.auth().createCustomToken(userId, customClaims);
    
    console.log(`Custom Token 생성 성공: userId=${userId}`);
    
    res.json({ 
      success: true,
      token: customToken 
    });
    
  } catch (error) {
    console.error('토큰 생성 오류:', error);
    res.status(500).json({ 
      error: '토큰 생성 실패',
      message: error.message 
    });
  }
});

// 사용자 정보로 토큰 생성 (이메일 기반)
app.post('/api/generate-token-by-email', async (req, res) => {
  try {
    const { email, apiKey } = req.body;
    
    if (!email || !apiKey) {
      return res.status(400).json({ 
        error: 'email과 apiKey가 필요합니다.' 
      });
    }
    
    // API 키 검증
    const validApiKeys = process.env.ADMIN_API_KEYS 
      ? process.env.ADMIN_API_KEYS.split(',')
      : ['admin1234'];
    
    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({ 
        error: '유효하지 않은 API 키입니다.' 
      });
    }
    
    // 이메일로 사용자 찾기 (Firebase Auth에서)
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // 사용자가 없으면 새로 생성
        user = await admin.auth().createUser({
          email: email,
          emailVerified: false
        });
      } else {
        throw error;
      }
    }
    
    // Custom Claims 설정
    const customClaims = {
      role: 'admin',
      email: email,
      apiKey: apiKey
    };
    
    // Custom Token 생성
    const customToken = await admin.auth().createCustomToken(user.uid, customClaims);
    
    console.log(`Custom Token 생성 성공: email=${email}, uid=${user.uid}`);
    
    res.json({ 
      success: true,
      token: customToken,
      userId: user.uid
    });
    
  } catch (error) {
    console.error('토큰 생성 오류:', error);
    res.status(500).json({ 
      error: '토큰 생성 실패',
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`토큰 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`Token Endpoint: http://localhost:${PORT}/api/generate-token`);
  console.log(`========================================\n`);
});

