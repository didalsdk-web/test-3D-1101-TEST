# env/config.js 로드 확인 방법

## 방법 1: Network 탭 확인 (가장 간단)

1. **개발자 도구 열기** (F12)
2. **Network 탭** 클릭
3. **페이지 새로고침** (F5 또는 Ctrl+R)
4. **필터에서 "JS" 선택** (JavaScript 파일만 보기)
5. **`config.js` 파일 찾기**
   - 파일명: `config.js`
   - 상태: `200` (성공) 또는 `404` (실패)
   - URL: `http://localhost:8000/env/config.js`

### 성공한 경우:
- Status: `200 OK`
- Type: `script`
- Size: 파일 크기 표시

### 실패한 경우:
- Status: `404 Not Found` (파일 없음)
- Status: `403 Forbidden` (권한 없음)
- 빨간색으로 표시됨

## 방법 2: Console 탭 확인

브라우저 콘솔에서 다음 메시지를 확인:

### 성공한 경우:
```
ENV_CONFIG: 로드됨
```

### 실패한 경우:
```
ENV_CONFIG: undefined
⚠️ ENV_CONFIG가 정의되지 않았습니다. env/config.js 파일을 확인하세요.
config.js 로드 실패
```

## 방법 3: Sources 탭 확인

1. **개발자 도구 열기** (F12)
2. **Sources 탭** 클릭
3. 왼쪽 파일 트리에서 확인:
   - `localhost:8000` 폴더 펼치기
   - `env` 폴더 펼치기
   - `config.js` 파일이 보이면 로드 성공

## 방법 4: 직접 URL 접속

브라우저 주소창에 입력:
```
http://localhost:8000/env/config.js
```

### 성공한 경우:
- JavaScript 코드가 화면에 표시됨
- `const ENV_CONFIG = { ... }` 코드가 보임

### 실패한 경우:
- `404 Not Found` 페이지
- 또는 빈 화면

## 방법 5: Console에서 직접 확인

콘솔에 다음 명령어 입력:
```javascript
console.log('ENV_CONFIG:', typeof ENV_CONFIG !== 'undefined' ? ENV_CONFIG : 'undefined');
```

### 성공한 경우:
```
ENV_CONFIG: {RECIPIENT_EMAIL: "...", FIREBASE: {...}, ADMIN: {...}}
```

### 실패한 경우:
```
ENV_CONFIG: undefined
```

## 문제 해결

### config.js가 로드되지 않는 경우:

1. **파일 경로 확인**
   - 파일이 `env/config.js` 경로에 있는지 확인
   - `test 3D 1101/env/config.js`

2. **서버 확인**
   - Python HTTP 서버가 실행 중인지 확인
   - `http://localhost:8000` 접속 가능한지 확인

3. **파일 권한 확인**
   - 파일이 읽기 가능한지 확인

4. **브라우저 캐시 클리어**
   - Ctrl+Shift+Delete
   - 또는 하드 리프레시: Ctrl+F5

