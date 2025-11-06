# Firebase Custom Token 서버 설정 가이드

## 단계별 설정

### 1. Firebase 서비스 계정 키 다운로드

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택 (`d-test-1101`)
3. 프로젝트 설정 (⚙️ 아이콘) → 서비스 계정 탭
4. "새 비공개 키 생성" 클릭
5. `serviceAccountKey.json` 파일이 다운로드됨
6. **중요**: 이 파일을 `env/serviceAccountKey.json` 경로에 저장

### 2. 서버 의존성 설치

```bash
cd server
npm install
```

또는 프로젝트 루트에서:

```bash
npm install --prefix server
```

### 3. 서버 실행

```bash
node server.js
```

또는 개발 모드 (nodemon 사용):

```bash
npm run dev --prefix server
```

서버가 정상적으로 실행되면:
```
========================================
토큰 서버가 포트 3000에서 실행 중입니다.
Health Check: http://localhost:3000/health
Token Endpoint: http://localhost:3000/api/generate-token
========================================
```

### 4. 테스트

#### Health Check
```bash
curl http://localhost:3000/health
```

#### 토큰 생성 테스트
```bash
curl -X POST http://localhost:3000/api/generate-token \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-123", "apiKey": "admin1234"}'
```

성공 시 응답:
```json
{
  "success": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. 클라이언트에서 사용

1. `index.html`을 브라우저에서 열기
2. 로그인 버튼 클릭
3. "토큰 로그인" 섹션에서:
   - 사용자 ID: `test-user-123` (또는 원하는 ID)
   - API 키: `admin1234` (env/config.js에 설정된 값)
4. "토큰으로 로그인" 버튼 클릭

## 환경 변수 설정 (선택사항)

프로덕션 환경에서는 환경 변수를 사용하세요:

```bash
export ADMIN_API_KEYS="admin1234,another-key-456"
export PORT=3000
node server.js
```

## 보안 주의사항

1. **서비스 계정 키 절대 공개하지 마세요**
   - `.gitignore`에 이미 추가되어 있습니다
   - GitHub에 올라가지 않도록 주의하세요

2. **API 키 관리**
   - `env/config.js`의 `ADMIN.API_KEYS` 배열에 유효한 키를 추가하세요
   - 실제 운영 시 강력한 키를 사용하세요

3. **HTTPS 사용**
   - 프로덕션에서는 반드시 HTTPS를 사용하세요
   - `env/config.js`의 `TOKEN_SERVER.URL`을 HTTPS URL로 변경하세요

4. **CORS 설정**
   - 현재는 모든 origin을 허용하고 있습니다
   - 프로덕션에서는 특정 도메인만 허용하도록 수정하세요

## 문제 해결

### 서버가 시작되지 않음
- `serviceAccountKey.json` 파일이 `env/` 폴더에 있는지 확인
- Node.js가 설치되어 있는지 확인 (`node --version`)
- 의존성이 설치되었는지 확인 (`npm list`)

### 토큰 생성 실패
- Firebase Console에서 서비스 계정 키가 올바른지 확인
- API 키가 `env/config.js`의 `ADMIN.API_KEYS`에 포함되어 있는지 확인
- 서버 로그를 확인하여 오류 메시지 확인

### 클라이언트에서 연결 실패
- 서버가 실행 중인지 확인 (`http://localhost:3000/health`)
- `env/config.js`의 `TOKEN_SERVER.URL`이 올바른지 확인
- 브라우저 콘솔에서 CORS 오류가 있는지 확인

## 다음 단계

1. 프로덕션 서버 배포 (Heroku, AWS, Google Cloud 등)
2. 환경 변수로 API 키 관리
3. 사용자별 API 키 발급 시스템 구축
4. Firestore에 사용자 정보 저장 및 검증

