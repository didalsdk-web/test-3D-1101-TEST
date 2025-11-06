# Boostcamp 웹사이트

## 환경 변수 설정

프로젝트의 환경 변수는 `env/config.js` 파일에서 관리합니다.

### 폴더 구조

```
env/
  ├── config.js          # 실제 환경 변수 설정 파일 (이 파일을 수정하세요)
  ├── config.example.js  # 환경 변수 설정 예제 파일
  └── .gitignore         # Git 버전 관리 제외 파일
```

### 설정 방법

1. `env/config.js` 파일을 열어서 필요한 값들을 수정합니다.

```javascript
const ENV_CONFIG = {
    RECIPIENT_EMAIL: 'didalsdk@gmail.com',  // 수신 이메일 주소
    // API_KEY: 'your-api-key-here',        // API 키 (필요시)
    // API_URL: 'https://api.example.com',  // API URL (필요시)
    // 기타 설정들...
};
```

2. 브라우저를 새로고침하면 변경사항이 적용됩니다.

### 새 환경 설정 추가하기

1. `env/config.example.js`를 참고하여 필요한 환경 변수를 확인합니다.
2. `env/config.js`에 새로운 변수를 추가합니다.
3. `index.html`의 JavaScript 코드에서 `ENV_CONFIG.변수명`으로 사용합니다.

### 현재 사용 중인 환경 변수

- `RECIPIENT_EMAIL`: 이메일 주소 (Contact 섹션과 Footer에 표시)

### 개발 서버 실행

```bash
# Python 서버 사용
python -m http.server 8000

# 또는 Node.js 사용
npx serve
```

브라우저에서 `http://localhost:8000` 접속

