# 이메일/비밀번호 로그인 vs 토큰 로그인 비교

## 🔐 저장 경로 및 보안 방식 차이

### 1. 이메일/비밀번호 로그인

#### 저장 경로
```
Firebase Authentication (클라우드)
├── Users Collection
│   ├── uid (자동 생성)
│   ├── email
│   ├── password (해시화되어 저장)
│   ├── emailVerified
│   └── metadata (생성일, 마지막 로그인 등)
```

#### 보안 방식
- **비밀번호**: Firebase가 자동으로 해시화하여 저장 (bcrypt 기반)
- **검증**: Firebase Authentication 서비스가 직접 처리
- **토큰**: Firebase ID Token 자동 발급 (1시간 유효)
- **사용자 정보**: Firebase Authentication에만 저장

#### 특징
- ✅ 간단한 구현 (백엔드 불필요)
- ✅ Firebase가 자동으로 비밀번호 관리
- ✅ 이메일 인증 기능 내장
- ❌ 비밀번호 재설정 등 추가 기능 필요시 Firebase Functions 사용
- ❌ 사용자별 커스텀 권한 관리가 제한적

---

### 2. 토큰 로그인 (Custom Token)

#### 저장 경로
```
1. 백엔드 서버 (로컬/클라우드)
   ├── API 키 검증 로직
   └── 사용자 ID 관리
   
2. Firebase Authentication (클라우드)
   ├── Users Collection
   │   ├── uid (사용자 ID로 직접 지정 가능)
   │   ├── customClaims (역할, 권한 등)
   │   │   ├── role: 'admin'
   │   │   ├── apiKey: 'xxx'
   │   │   └── 기타 커스텀 정보
   │   └── metadata

3. 선택적: Firestore/외부 DB
   └── 사용자 추가 정보 (API 키, 프로필 등)
```

#### 보안 방식
- **API 키 검증**: 백엔드 서버에서 검증 (env/config.js 또는 DB)
- **토큰 생성**: Firebase Admin SDK로 Custom Token 생성
- **Custom Claims**: 사용자별 역할, 권한 등을 토큰에 포함
- **사용자 ID**: 직접 제어 가능 (Firebase가 자동 생성하지 않음)

#### 특징
- ✅ 사용자 ID 직접 제어 가능
- ✅ 세밀한 권한 관리 (Custom Claims)
- ✅ API 키 기반 인증 (비밀번호 없음)
- ✅ 백엔드에서 추가 검증 가능
- ❌ 백엔드 서버 필요
- ❌ API 키 관리 필요

---

## 📊 상세 비교표

| 항목 | 이메일/비밀번호 | 토큰 로그인 |
|------|----------------|------------|
| **저장 위치** | Firebase Authentication만 | Firebase Auth + 백엔드 서버 |
| **인증 방식** | 이메일 + 비밀번호 | 사용자 ID + API 키 |
| **비밀번호 관리** | Firebase가 자동 관리 | API 키 (백엔드에서 관리) |
| **사용자 ID** | Firebase가 자동 생성 (UID) | 직접 지정 가능 |
| **권한 관리** | 기본 정보만 | Custom Claims로 세밀한 제어 |
| **토큰 종류** | Firebase ID Token | Custom Token → ID Token |
| **백엔드 필요** | 불필요 | 필요 |
| **보안 레벨** | 표준 | 더 세밀한 제어 가능 |

---

## 🔒 보안 방식 상세

### 이메일/비밀번호 로그인

```javascript
// 클라이언트에서 직접 호출
firebase.auth().signInWithEmailAndPassword(email, password)

// 저장 방식
Firebase Authentication:
  - email: "user@example.com"
  - passwordHash: "bcrypt_hash..." (Firebase가 관리)
  - uid: "auto-generated-uid"
```

**보안 특징:**
- 비밀번호는 Firebase가 해시화하여 저장
- 클라이언트에서 비밀번호를 직접 전송 (HTTPS 필수)
- Firebase가 자동으로 토큰 관리

---

### 토큰 로그인

```javascript
// 1단계: 백엔드에서 Custom Token 생성
POST /api/generate-token
{
  userId: "custom-user-id",
  apiKey: "secret-api-key"
}

// 백엔드 검증 후 Custom Token 생성
admin.auth().createCustomToken(userId, {
  role: 'admin'
  // ⚠️ API 키는 Custom Claims에 저장하지 않음 (보안 위험)
})

// 2단계: 클라이언트에서 Custom Token으로 로그인
firebase.auth().signInWithCustomToken(customToken)

// 저장 방식
Firebase Authentication:
  - uid: "custom-user-id" (직접 지정)
  - customClaims: {
      role: "admin",
      apiKey: "xxx"
    }
```

**보안 특징:**
- API 키는 백엔드 서버에서만 검증 (클라이언트에 노출 안 됨)
- Custom Claims에 추가 정보 포함 가능
- 사용자 ID를 직접 제어 가능

---

## 🛡️ 보안 강화 방법

### 이메일/비밀번호 방식
1. **HTTPS 필수**: 모든 통신 암호화
2. **비밀번호 정책**: Firebase에서 설정 가능
3. **이메일 인증**: `emailVerified` 확인
4. **2단계 인증**: Firebase Auth에서 지원

### 토큰 방식
1. **API 키 관리**: 
   - 환경 변수로 관리 (`env/config.js`)
   - Git에 커밋하지 않음 (`.gitignore`)
2. **백엔드 검증**: 
   - 서버에서 API 키 검증
   - DB에서 사용자 정보 확인 가능
3. **Custom Claims**: 
   - 역할 기반 접근 제어
   - Firestore 보안 규칙에서 사용
4. **토큰 만료**: 
   - Custom Token은 1시간 후 만료
   - ID Token 자동 갱신

---

## 💾 실제 데이터 저장 예시

### 이메일/비밀번호 로그인 후

```javascript
// Firebase Authentication에 저장됨
{
  uid: "abc123xyz789",  // Firebase가 자동 생성
  email: "user@example.com",
  emailVerified: false,
  passwordHash: "***",  // Firebase가 관리
  displayName: null,
  photoURL: null,
  metadata: {
    creationTime: "2025-11-06T...",
    lastSignInTime: "2025-11-06T..."
  }
}
```

### 토큰 로그인 후

```javascript
// Firebase Authentication에 저장됨
{
  uid: "custom-user-123",  // 직접 지정한 ID
  email: null,  // 없을 수 있음
  customClaims: {
    role: "admin",
    apiKey: "admin1234",
    // 추가 커스텀 정보 가능
  },
  metadata: {
    creationTime: "2025-11-06T...",
    lastSignInTime: "2025-11-06T..."
  }
}

// 백엔드 서버에서 관리 (선택적)
// Firestore 또는 외부 DB
{
  userId: "custom-user-123",
  apiKey: "hashed-api-key",
  role: "admin",
  createdAt: "2025-11-06T...",
  lastLogin: "2025-11-06T..."
}
```

---

## 🎯 사용 사례

### 이메일/비밀번호 로그인을 사용하는 경우
- ✅ 일반 사용자 회원가입/로그인
- ✅ 간단한 웹사이트
- ✅ 백엔드 서버 구축이 어려운 경우
- ✅ Firebase Authentication의 기본 기능으로 충분한 경우

### 토큰 로그인을 사용하는 경우
- ✅ 관리자 전용 시스템
- ✅ API 키 기반 인증이 필요한 경우
- ✅ 외부 시스템과 통합
- ✅ 세밀한 권한 관리가 필요한 경우
- ✅ 사용자 ID를 직접 제어해야 하는 경우

---

## 🔄 현재 프로젝트에서의 사용

### 현재 구현 상태

1. **이메일/비밀번호 로그인**: 
   - 일반 사용자용
   - Firebase Authentication에 저장
   - 간단한 회원가입/로그인

2. **토큰 로그인**: 
   - 관리자용 (API 키 기반)
   - 백엔드 서버에서 Custom Token 생성
   - Custom Claims로 관리자 역할 설정
   - 사용자 ID 직접 제어 가능

### 두 방식의 공존

두 방식은 **동시에 사용 가능**하며, 각각 다른 용도로 사용됩니다:
- **이메일/비밀번호**: 일반 사용자
- **토큰 로그인**: 관리자/특수 사용자

둘 다 Firebase Authentication에 저장되지만, 저장되는 정보와 검증 방식이 다릅니다.

