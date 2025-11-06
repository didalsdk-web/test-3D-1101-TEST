# Firebase Custom Token 인증 구현 완료

## 구현된 기능

✅ **백엔드 서버** (`server.js`)
- Firebase Custom Token 생성
- API 키 기반 인증
- 사용자 ID 또는 이메일로 토큰 생성

✅ **클라이언트 코드** (`index.html`)
- 토큰 로그인 UI 추가
- Custom Token으로 Firebase 인증
- 관리자 권한 확인

✅ **환경 설정** (`env/config.js`)
- 토큰 서버 URL 설정
- API 키 관리

## 빠른 시작

### 1. Firebase 서비스 계정 키 설정

1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. 다운로드된 파일을 `env/serviceAccountKey.json`으로 저장

### 2. 서버 실행

```bash
# 의존성 설치
cd server
npm install

# 서버 실행
node ../server.js
```

### 3. 테스트

1. 브라우저에서 `index.html` 열기
2. 로그인 버튼 클릭
3. "토큰 로그인" 섹션에서:
   - 사용자 ID: `test-user-123`
   - API 키: `admin1234`
4. "토큰으로 로그인" 클릭

## 파일 구조

```
프로젝트/
├── server.js              # 토큰 생성 서버
├── server/
│   └── package.json       # 서버 의존성
├── env/
│   ├── config.js         # 환경 설정 (토큰 서버 URL 포함)
│   └── serviceAccountKey.json  # Firebase 서비스 계정 키 (Git 제외)
├── index.html            # 클라이언트 (토큰 로그인 포함)
├── SETUP_TOKEN_SERVER.md # 상세 설정 가이드
└── TOKEN_AUTH_GUIDE.md   # 토큰 인증 가이드
```

## 주요 함수

### 클라이언트
- `handleTokenLogin(event)` - 토큰 로그인 핸들러
- `fetchTokenFromServer(userId, apiKey)` - 서버에서 토큰 가져오기
- `signInWithCustomToken(customToken)` - Firebase Custom Token 로그인

### 서버
- `POST /api/generate-token` - 사용자 ID + API 키로 토큰 생성
- `POST /api/generate-token-by-email` - 이메일 + API 키로 토큰 생성
- `GET /health` - 서버 상태 확인

## 보안

- ✅ 서비스 계정 키는 `.gitignore`에 포함
- ✅ API 키는 `env/config.js`에서 관리
- ⚠️ 프로덕션에서는 강력한 API 키 사용 필요
- ⚠️ HTTPS 사용 권장

## 다음 단계

1. 프로덕션 서버 배포
2. 사용자별 API 키 발급 시스템
3. Firestore에 사용자 정보 저장
4. 토큰 만료 시간 관리

