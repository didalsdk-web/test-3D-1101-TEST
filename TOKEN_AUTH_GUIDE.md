# 토큰 기반 인증 구현 가이드

## 개요
이메일/비밀번호 대신 Custom Token을 사용하여 Firebase Authentication을 구현하는 방법입니다.

## 방법 1: Firebase Custom Token (권장)

### 아키텍처
```
클라이언트 → 백엔드 서버 (토큰 생성) → Firebase Custom Token → 클라이언트 → Firebase Auth
```

### 필요한 것
1. **Firebase Admin SDK** (백엔드 서버)
2. **서비스 계정 키** (Firebase Console에서 다운로드)

---

## 단계별 구현

### 1. Firebase 서비스 계정 키 다운로드

1. Firebase Console 접속
2. 프로젝트 설정 → 서비스 계정
3. "새 비공개 키 생성" 클릭
4. `serviceAccountKey.json` 파일 다운로드
5. **중요**: 이 파일을 `.gitignore`에 추가

### 2. 백엔드 서버 예제 (Node.js)

#### `server.js` (간단한 Express 서버)

```javascript
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin SDK 초기화
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 토큰 생성 엔드포인트
app.post('/api/generate-token', async (req, res) => {
  try {
    const { userId, customClaims } = req.body;
    
    // 사용자 ID 검증 (실제로는 DB에서 사용자 확인)
    // 예: const user = await db.getUser(userId);
    // if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Custom Token 생성
    const customToken = await admin.auth().createCustomToken(userId, customClaims);
    
    res.json({ token: customToken });
  } catch (error) {
    console.error('토큰 생성 오류:', error);
    res.status(500).json({ error: '토큰 생성 실패' });
  }
});

// 사용자 검증 엔드포인트 (예: API 키로 사용자 확인)
app.post('/api/verify-and-generate-token', async (req, res) => {
  try {
    const { apiKey, userId } = req.body;
    
    // API 키 검증 (실제로는 DB에서 확인)
    const validApiKeys = ['your-secret-api-key-123'];
    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Custom Token 생성
    const customToken = await admin.auth().createCustomToken(userId, {
      role: 'admin', // 커스텀 클레임 추가 가능
      apiKey: apiKey
    });
    
    res.json({ token: customToken });
  } catch (error) {
    console.error('토큰 생성 오류:', error);
    res.status(500).json({ error: '토큰 생성 실패' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
```

#### `package.json`

```json
{
  "name": "firebase-token-server",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "firebase-admin": "^11.10.1",
    "cors": "^2.8.5"
  }
}
```

### 3. 클라이언트 측 구현 (현재 프로젝트)

#### `index.html`에 추가할 함수

```javascript
// 토큰 기반 로그인 함수
async function handleTokenLogin(token) {
    if (!window.firebaseAuth) {
        alert('Firebase가 초기화되지 않았습니다.');
        return false;
    }
    
    try {
        // Custom Token으로 로그인
        const userCredential = await window.firebaseAuth.signInWithCustomToken(token);
        console.log('토큰 로그인 성공:', userCredential.user.uid);
        
        // 사용자 정보 가져오기
        const idToken = await userCredential.user.getIdTokenResult();
        console.log('사용자 클레임:', idToken.claims);
        
        alert('토큰 로그인 성공!');
        closeLoginModal();
        checkLoginStatus();
        
        return true;
    } catch (error) {
        console.error('토큰 로그인 오류:', error);
        let errorMessage = '토큰 로그인에 실패했습니다.';
        
        switch(error.code) {
            case 'auth/invalid-custom-token':
                errorMessage = '유효하지 않은 토큰입니다.';
                break;
            case 'auth/custom-token-mismatch':
                errorMessage = '토큰이 일치하지 않습니다.';
                break;
            default:
                errorMessage = `토큰 로그인 오류: ${error.message}`;
        }
        
        alert(errorMessage);
        return false;
    }
}

// 백엔드에서 토큰 가져오기
async function fetchTokenFromServer(userId, apiKey) {
    try {
        const response = await fetch('http://localhost:3000/api/verify-and-generate-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                apiKey: apiKey
            })
        });
        
        if (!response.ok) {
            throw new Error('토큰 요청 실패');
        }
        
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('토큰 요청 오류:', error);
        throw error;
    }
}

// 토큰 로그인 버튼 핸들러
async function handleTokenLoginButton() {
    const userId = document.getElementById('tokenUserId').value.trim();
    const apiKey = document.getElementById('tokenApiKey').value.trim();
    
    if (!userId || !apiKey) {
        alert('사용자 ID와 API 키를 입력하세요.');
        return;
    }
    
    try {
        // 서버에서 토큰 가져오기
        const token = await fetchTokenFromServer(userId, apiKey);
        
        // 토큰으로 로그인
        await handleTokenLogin(token);
    } catch (error) {
        alert('토큰을 가져오는데 실패했습니다.');
    }
}
```

---

## 방법 2: 외부 JWT 토큰을 Firebase ID Token으로 변환

외부 인증 서버의 JWT 토큰을 받아서 Firebase로 인증하는 방법입니다.

### 클라이언트 측 구현

```javascript
// 외부 JWT 토큰을 받아서 Firebase로 인증
async function handleExternalTokenLogin(externalToken) {
    // 1. 외부 서버에서 토큰 검증 및 사용자 정보 가져오기
    const userInfo = await fetch('https://your-auth-server.com/verify', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${externalToken}`,
            'Content-Type': 'application/json'
        }
    }).then(res => res.json());
    
    // 2. Firebase Custom Token 생성 요청 (백엔드가 필요)
    const firebaseToken = await fetch('http://localhost:3000/api/generate-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userInfo.userId,
            customClaims: {
                email: userInfo.email,
                role: userInfo.role
            }
        })
    }).then(res => res.json());
    
    // 3. Firebase Custom Token으로 로그인
    await handleTokenLogin(firebaseToken.token);
}
```

---

## 방법 3: 클라우드 함수 사용 (Firebase Functions)

서버 없이 Firebase Cloud Functions를 사용하는 방법입니다.

### `functions/index.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.generateCustomToken = functions.https.onCall(async (data, context) => {
    // API 키 검증
    const apiKey = data.apiKey;
    const userId = data.userId;
    
    // 실제로는 Firestore에서 사용자 확인
    const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();
    
    if (!userDoc.exists || userDoc.data().apiKey !== apiKey) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Invalid API key or user ID'
        );
    }
    
    // Custom Token 생성
    const customToken = await admin.auth().createCustomToken(userId, {
        role: userDoc.data().role || 'user'
    });
    
    return { token: customToken };
});
```

### 클라이언트에서 호출

```javascript
const functions = firebase.functions();
const generateToken = functions.httpsCallable('generateCustomToken');

async function handleCloudFunctionTokenLogin(userId, apiKey) {
    try {
        const result = await generateToken({ userId, apiKey });
        await handleTokenLogin(result.data.token);
    } catch (error) {
        console.error('토큰 생성 오류:', error);
        alert('토큰 생성에 실패했습니다.');
    }
}
```

---

## 보안 고려사항

1. **서비스 계정 키**: 절대 클라이언트에 노출하지 마세요
2. **API 키 검증**: 백엔드에서 반드시 검증하세요
3. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS를 사용하세요
4. **토큰 만료**: Custom Token은 1시간 후 만료됩니다
5. **CORS 설정**: 백엔드 서버의 CORS를 적절히 설정하세요

---

## 장단점 비교

### Custom Token 방식
**장점:**
- Firebase와 완전 통합
- Firestore 보안 규칙에서 사용 가능
- 사용자별 커스텀 클레임 추가 가능

**단점:**
- 백엔드 서버 필요
- 초기 설정 복잡

### 이메일/비밀번호 방식
**장점:**
- 간단한 구현
- 백엔드 불필요
- Firebase가 직접 관리

**단점:**
- 비밀번호 관리 필요
- 사용자 관리 복잡

---

## 다음 단계

1. Firebase Console에서 서비스 계정 키 다운로드
2. 백엔드 서버 구축 (Node.js 예제 사용)
3. 클라이언트 코드에 토큰 로그인 함수 추가
4. 테스트 및 배포

