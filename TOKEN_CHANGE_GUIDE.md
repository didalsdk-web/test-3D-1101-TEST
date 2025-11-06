# 토큰 로그인 사용자 ID 및 API 키 변경 가이드

## 변경 가능 여부

### ✅ 변경 가능
- **사용자 ID**: 클라이언트에서 직접 입력하는 값이므로 언제든지 변경 가능
- **API 키**: `env/config.js`와 서버 설정에서 변경 가능

---

## 🔧 변경 방법

### 1. API 키 변경

#### 방법 A: `env/config.js`에서 변경 (권장)

```javascript
// env/config.js
ADMIN: {
    API_KEYS: ['new-api-key-123', 'another-key-456'] // 여러 개 가능
}
```

#### 방법 B: 환경 변수로 설정 (서버 실행 시)

```bash
# Windows PowerShell
$env:ADMIN_API_KEYS="new-api-key-123,another-key-456"
node server.js

# Linux/Mac
ADMIN_API_KEYS="new-api-key-123,another-key-456" node server.js
```

#### 방법 C: `.env` 파일 사용 (권장 - 프로덕션)

```bash
# .env 파일 생성
ADMIN_API_KEYS=new-api-key-123,another-key-456
```

그리고 `server.js`에 dotenv 추가:
```javascript
require('dotenv').config();
const validApiKeys = process.env.ADMIN_API_KEYS 
  ? process.env.ADMIN_API_KEYS.split(',')
  : ['admin1234'];
```

---

### 2. 사용자 ID 변경

사용자 ID는 **클라이언트에서 직접 입력**하는 값이므로 특별한 설정 없이 바로 변경 가능합니다.

---

## ⚠️ 변경 시 발생할 수 있는 문제점

### 1. API 키 변경 시 문제점

#### 문제점 A: 설정 불일치
- **증상**: "유효하지 않은 API 키입니다" 오류
- **원인**: 
  - `env/config.js`의 `API_KEYS`와 서버의 `ADMIN_API_KEYS` 환경 변수가 다름
  - 서버가 재시작되지 않아 이전 설정이 유지됨
- **해결책**:
  1. `env/config.js`와 서버 설정을 동기화
  2. 서버 재시작: `node server.js` 다시 실행

#### 문제점 B: 기존 사용자 로그인 불가
- **증상**: 기존에 로그인했던 사용자들이 더 이상 로그인할 수 없음
- **원인**: API 키가 변경되면 이전 API 키로는 토큰을 생성할 수 없음
- **해결책**:
  - **과도기적 해결**: 기존 API 키와 새 API 키를 모두 허용
    ```javascript
    API_KEYS: ['old-key-123', 'new-key-456'] // 둘 다 허용
    ```
  - **완전 전환**: 모든 사용자에게 새 API 키 안내

#### 문제점 C: 보안 취약점
- **증상**: API 키가 유출되면 무단 접근 가능
- **원인**: 
  - API 키가 너무 단순함 (예: 'admin1234')
  - API 키가 Git에 커밋됨
  - API 키가 클라이언트 코드에 하드코딩됨
- **해결책**:
  1. **강력한 API 키 사용**: 최소 32자 이상, 랜덤 문자열
  2. **환경 변수로 관리**: `.env` 파일 사용, Git에 커밋하지 않음
  3. **정기적 로테이션**: 보안을 위해 정기적으로 변경

---

### 2. 사용자 ID 변경 시 문제점

#### 문제점 A: Firebase Authentication 사용자 생성
- **증상**: 새로운 사용자 ID로 로그인하면 Firebase Authentication에 새 사용자가 생성됨
- **원인**: 
  - Firebase Custom Token은 `userId`를 직접 사용하여 토큰 생성
  - 해당 ID의 사용자가 없으면 Firebase가 자동으로 생성
- **영향**:
  - 이전 사용자 ID로 생성된 데이터와 연결되지 않음
  - 사용자별 데이터가 분리됨
- **해결책**:
  1. **일관된 사용자 ID 사용**: 항상 같은 사용자 ID 사용
  2. **사용자 ID 매핑 테이블**: 여러 사용자 ID를 하나의 실제 사용자로 매핑

#### 문제점 B: 기존 데이터 접근 불가
- **증상**: 사용자 ID를 변경하면 이전 사용자 ID로 저장된 데이터에 접근 불가
- **원인**: 
  - Firestore 보안 규칙이 `uid` 기반으로 설정된 경우
  - 사용자별 데이터가 `userId`로 구분되어 저장된 경우
- **예시**:
  ```javascript
  // Firestore 구조
  users/{userId}/messages/{messageId}
  // userId가 변경되면 이전 데이터에 접근 불가
  ```
- **해결책**:
  1. **사용자 ID 변경 금지**: 운영 환경에서는 사용자 ID 변경을 제한
  2. **데이터 마이그레이션**: 사용자 ID 변경 시 이전 데이터를 새 사용자 ID로 이동
  3. **이메일 기반 사용자 ID**: Firebase UID를 사용하여 일관성 유지

#### 문제점 C: Custom Claims 불일치
- **증상**: 사용자 ID 변경 시 권한(role)이 제대로 적용되지 않음
- **원인**: Custom Claims가 사용자 ID별로 다르게 설정될 수 있음
- **해결책**: 
  - 사용자 ID와 관계없이 일관된 Custom Claims 사용
  - API 키 기반으로 권한 부여 (현재 구현)

---

## 🛡️ 권장 사항

### 1. API 키 관리

#### ✅ 권장 사항
- **환경 변수 사용**: `.env` 파일로 관리
- **강력한 키 사용**: 최소 32자 이상, 랜덤 문자열
- **Git 제외**: `.gitignore`에 `.env` 추가
- **정기적 로테이션**: 3-6개월마다 변경
- **여러 키 허용**: 과도기적 전환을 위해

#### ❌ 피해야 할 것
- 하드코딩된 API 키
- 너무 단순한 키 (예: 'admin1234', '1234')
- Git에 커밋된 키
- 클라이언트 코드에 노출된 키

---

### 2. 사용자 ID 관리

#### ✅ 권장 사항
- **일관된 사용자 ID**: 한 번 설정한 사용자 ID는 변경하지 않음
- **Firebase UID 사용**: 이메일 기반 엔드포인트 사용 권장
- **사용자 ID 정책**: 운영 전에 사용자 ID 규칙 수립

#### ❌ 피해야 할 것
- 자주 변경하는 사용자 ID
- 사용자 입력에 의존하는 사용자 ID
- 예측 가능한 사용자 ID

---

## 📋 변경 체크리스트

### API 키 변경 시
- [ ] `env/config.js`의 `API_KEYS` 업데이트
- [ ] 서버 환경 변수 업데이트 (또는 `.env` 파일)
- [ ] 서버 재시작
- [ ] 기존 사용자에게 새 API 키 안내
- [ ] 과도기적 전환을 위해 기존 키도 유지 (선택)
- [ ] 테스트: 새 API 키로 로그인 확인
- [ ] 보안: 강력한 키 사용 확인

### 사용자 ID 변경 시
- [ ] 변경 이유 확인 (정말 필요한가?)
- [ ] 기존 데이터 마이그레이션 계획 수립
- [ ] Firestore 보안 규칙 확인
- [ ] Custom Claims 확인
- [ ] 테스트: 새 사용자 ID로 로그인 및 데이터 접근 확인
- [ ] 문서화: 사용자 ID 변경 이력 기록

---

## 🔍 현재 구현 상태

### 현재 설정
```javascript
// env/config.js
ADMIN: {
    API_KEYS: ['admin1234'] // ⚠️ 보안상 취약함
}

// server.js
const validApiKeys = process.env.ADMIN_API_KEYS 
  ? process.env.ADMIN_API_KEYS.split(',')
  : ['admin1234']; // ⚠️ 기본값
```

### 문제점
1. **API 키가 너무 단순함**: 'admin1234'는 예측 가능
2. **하드코딩**: 환경 변수로 관리되지 않음
3. **Git에 커밋됨**: `env/config.js`가 Git에 포함되어 있음 (`.gitignore`에 추가됨)

### 개선 방안
1. **강력한 API 키 생성**:
   ```bash
   # Node.js에서 생성
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **환경 변수로 관리**:
   ```javascript
   // server.js
   require('dotenv').config();
   const validApiKeys = process.env.ADMIN_API_KEYS.split(',');
   ```

3. **`.env` 파일 사용**:
   ```bash
   # .env (Git에 커밋하지 않음)
   ADMIN_API_KEYS=strong-random-key-here-32-chars-min
   ```

---

## 🚨 긴급 상황 대응

### API 키 유출 시
1. **즉시 새 API 키 생성**
2. **기존 API 키 무효화**
3. **모든 사용자에게 새 키 안내**
4. **로그 확인**: 유출된 키로의 접근 시도 확인
5. **Firebase 보안 규칙 점검**

### 사용자 ID 충돌 시
1. **Firebase Console에서 사용자 확인**
2. **중복 사용자 ID 확인**
3. **데이터 마이그레이션 계획 수립**
4. **사용자 ID 정책 수립**

---

## 📞 문의

토큰 로그인 관련 문제가 발생하면:
1. 서버 로그 확인 (`server.js` 콘솔 출력)
2. Firebase Console에서 사용자 확인
3. 브라우저 콘솔에서 오류 확인
4. 네트워크 탭에서 API 요청 확인

