# Firebase Authentication에 API 키 저장 관련 가이드

## ❌ Firebase Authentication에 API 키를 저장하면 안 되는 이유

### 1. 설계 원칙 위반

Firebase Authentication은 **사용자 인증 정보**만 관리하도록 설계되었습니다:
- 이메일 주소
- 비밀번호 해시
- 사용자 메타데이터 (이름, 프로필 사진 등)
- 사용자 UID

**API 키는 인증 정보가 아닙니다.** API 키는:
- 서비스 간 인증을 위한 키
- 백엔드 서버에서 사용하는 관리 키
- 사용자별 인증 정보가 아닌 시스템 레벨 설정

---

### 2. 보안 문제

#### 문제점 A: API 키 유출 위험
```javascript
// ❌ 잘못된 방법: Firebase Authentication에 API 키 저장
await admin.auth().setCustomUserClaims(uid, {
  role: 'admin',
  apiKey: 'secret-api-key-123' // ⚠️ 위험!
});

// 클라이언트에서 접근 가능
const idToken = await user.getIdTokenResult();
console.log(idToken.claims.apiKey); // ⚠️ API 키가 노출됨!
```

**문제:**
- Custom Claims는 클라이언트의 ID Token에 포함됨
- 브라우저 개발자 도구에서 확인 가능
- API 키가 노출되면 보안 취약점 발생

#### 문제점 B: 권한 관리 혼란
- API 키는 **시스템 레벨** 설정
- 사용자별로 다른 API 키를 저장하면 권한 관리가 복잡해짐
- API 키 변경 시 모든 사용자의 Custom Claims를 업데이트해야 함

---

### 3. Firebase Authentication의 역할

Firebase Authentication은 다음만 관리합니다:

```javascript
// ✅ Firebase Authentication에 저장되는 정보
{
  uid: "user123",
  email: "user@example.com",
  emailVerified: true,
  passwordHash: "bcrypt_hash...", // Firebase가 관리
  displayName: "사용자 이름",
  photoURL: "https://...",
  customClaims: {
    role: "admin", // ✅ 권한 정보는 OK
    // apiKey: "xxx" // ❌ API 키는 저장하지 않음
  }
}
```

---

## ✅ 올바른 방법

### 방법 1: Custom Claims에 권한 정보만 저장

```javascript
// ✅ 올바른 방법: 권한 정보만 저장
await admin.auth().setCustomUserClaims(uid, {
  role: 'admin',
  permissions: ['read', 'write'], // 권한 정보
  // API 키는 저장하지 않음
});
```

**클라이언트에서 확인:**
```javascript
const idToken = await user.getIdTokenResult();
console.log(idToken.claims.role); // 'admin'
console.log(idToken.claims.permissions); // ['read', 'write']
// API 키는 노출되지 않음
```

---

### 방법 2: Firestore에 사용자별 API 키 저장 (필요한 경우)

API 키를 **사용자별로 관리**해야 한다면, Firestore를 사용하세요:

```javascript
// ✅ Firestore에 저장 (Firebase Authentication이 아닌)
await admin.firestore()
  .collection('userApiKeys')
  .doc(uid)
  .set({
    apiKey: 'user-specific-key-123',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUsed: null
  });
```

**장점:**
- Firestore 보안 규칙으로 접근 제어 가능
- 클라이언트에서 직접 접근 불가 (보안 규칙 설정)
- API 키 변경이 쉬움

**Firestore 보안 규칙 예시:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 API 키만 읽을 수 있음
    match /userApiKeys/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // 클라이언트에서 수정 불가
    }
  }
}
```

---

### 방법 3: 백엔드 서버에서 API 키 관리 (권장)

현재 프로젝트처럼 **백엔드 서버**에서 API 키를 관리하는 것이 가장 안전합니다:

```javascript
// ✅ server.js (백엔드)
const validApiKeys = ['admin1234', 'another-key'];

app.post('/api/generate-token', async (req, res) => {
  const { userId, apiKey } = req.body;
  
  // API 키 검증 (서버에서만)
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Custom Token 생성 (API 키는 저장하지 않음)
  const customToken = await admin.auth().createCustomToken(userId, {
    role: 'admin' // ✅ 권한만 저장
  });
  
  res.json({ token: customToken });
});
```

**장점:**
- API 키가 클라이언트에 노출되지 않음
- 서버에서만 API 키 검증
- API 키 변경이 쉬움 (서버 설정만 변경)

---

## 🔍 두 가지 "API 키"의 차이

### 1. Firebase API Key (클라이언트 SDK 키)

```javascript
// env/config.js
FIREBASE: {
  apiKey: "AIzaSyDKF8-n5gdpPcFqJJFUpgfvg6oi7FIQYn0" // ✅ 이것은 공개 키
}
```

**특징:**
- **공개 키** (클라이언트 코드에 노출되어도 됨)
- Firebase 프로젝트 식별용
- Firebase 서비스 접근 제한용 (도메인 제한 등)
- **사용자 인증과는 무관**

---

### 2. Custom Token API Key (백엔드 인증 키)

```javascript
// env/config.js
ADMIN: {
  API_KEYS: ['admin1234'] // ⚠️ 이것은 비밀 키
}
```

**특징:**
- **비밀 키** (절대 노출되면 안 됨)
- 백엔드 서버에서만 사용
- Custom Token 생성 시 인증용
- **Firebase Authentication에 저장하지 않음**

---

## 📊 비교표

| 항목 | Firebase API Key | Custom Token API Key |
|------|----------------|---------------------|
| **용도** | 프로젝트 식별 | 백엔드 인증 |
| **공개 여부** | 공개 가능 | 비밀 (노출 금지) |
| **저장 위치** | 클라이언트 코드 | 백엔드 서버 |
| **Firebase Auth 저장** | 불필요 (프로젝트 설정) | ❌ 저장하면 안 됨 |
| **사용자별 관리** | 불필요 | 필요시 Firestore 사용 |

---

## 🚨 실제 예시: 잘못된 방법 vs 올바른 방법

### ❌ 잘못된 방법

```javascript
// server.js
app.post('/api/generate-token', async (req, res) => {
  const { userId, apiKey } = req.body;
  
  // API 키 검증
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // ❌ 잘못된 방법: API 키를 Custom Claims에 저장
  const customToken = await admin.auth().createCustomToken(userId, {
    role: 'admin',
    apiKey: apiKey // ⚠️ 위험! 클라이언트에 노출됨
  });
  
  res.json({ token: customToken });
});
```

**문제점:**
```javascript
// 클라이언트에서
const idToken = await user.getIdTokenResult();
console.log(idToken.claims.apiKey); // ⚠️ API 키가 노출됨!
// 브라우저 개발자 도구에서 확인 가능
```

---

### ✅ 올바른 방법

```javascript
// server.js
app.post('/api/generate-token', async (req, res) => {
  const { userId, apiKey } = req.body;
  
  // ✅ API 키 검증 (서버에서만)
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // ✅ 권한 정보만 저장
  const customToken = await admin.auth().createCustomToken(userId, {
    role: 'admin' // API 키는 저장하지 않음
  });
  
  res.json({ token: customToken });
});
```

**결과:**
```javascript
// 클라이언트에서
const idToken = await user.getIdTokenResult();
console.log(idToken.claims.role); // 'admin' ✅
console.log(idToken.claims.apiKey); // undefined ✅ (노출되지 않음)
```

---

## 💡 이메일/비밀번호 가입 시 API 키 관리

### 시나리오: 이메일/비밀번호로 가입한 사용자에게 API 키 부여

#### 방법 A: Firestore에 저장 (권장)

```javascript
// 회원가입 후
async function signupWithEmail(email, password) {
  const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
  const uid = userCredential.user.uid;
  
  // ✅ Firestore에 API 키 저장 (Firebase Auth가 아닌)
  await firestore.collection('users').doc(uid).set({
    apiKey: generateApiKey(), // 사용자별 API 키 생성
    createdAt: firestore.FieldValue.serverTimestamp()
  });
  
  // ✅ Custom Claims에 권한만 저장
  await admin.auth().setCustomUserClaims(uid, {
    role: 'user',
    hasApiKey: true
  });
}
```

**Firestore에서 API 키 조회 (백엔드에서만):**
```javascript
// server.js
app.post('/api/generate-token', async (req, res) => {
  const { userId, apiKey } = req.body;
  
  // Firestore에서 사용자 API 키 확인
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(userId)
    .get();
  
  if (!userDoc.exists || userDoc.data().apiKey !== apiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Custom Token 생성 (API 키는 저장하지 않음)
  const customToken = await admin.auth().createCustomToken(userId, {
    role: userDoc.data().role || 'user'
  });
  
  res.json({ token: customToken });
});
```

---

#### 방법 B: 별도 사용자 테이블 관리 (DB 사용 시)

```javascript
// MySQL/MongoDB 등 사용 시
const user = await db.users.findOne({ 
  email: email,
  apiKey: apiKey 
});

if (!user) {
  return res.status(401).json({ error: 'Invalid credentials' });
}

// Firebase Custom Token 생성
const customToken = await admin.auth().createCustomToken(user.firebaseUid, {
  role: user.role
});
```

---

## ✅ 결론

### 이메일/비밀번호로 회원가입한 경우:

1. **❌ Firebase Authentication에 API 키 저장하지 않음**
   - Custom Claims에 API 키를 저장하면 클라이언트에 노출됨
   - 보안 위험 발생

2. **✅ 권한 정보만 Custom Claims에 저장**
   ```javascript
   customClaims: {
     role: 'admin',
     permissions: ['read', 'write']
   }
   ```

3. **✅ API 키는 별도로 관리**
   - Firestore (권장)
   - 백엔드 서버 설정
   - 외부 데이터베이스

4. **✅ 현재 프로젝트 구조는 올바름**
   - 백엔드 서버에서 API 키 검증
   - Custom Token 생성 시 API 키는 저장하지 않음
   - Custom Claims에는 권한 정보만 저장

---

## 📚 참고 자료

- [Firebase Custom Claims 공식 문서](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication 보안 모범 사례](https://firebase.google.com/docs/auth/security-best-practices)

