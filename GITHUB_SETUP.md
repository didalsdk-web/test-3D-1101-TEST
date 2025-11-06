# GitHub 연동 설정 가이드

## ✅ 현재 설정 상태

### GitHub 토큰 설정
- **토큰**: `env/config.js`에 저장됨
- **Git Remote**: 토큰이 포함된 URL로 설정됨

### 저장소 정보
- **Owner**: `didalsdk-web`
- **Repository**: `test-3D-1101-TEST`
- **URL**: `https://github.com/didalsdk-web/test-3D-1101-TEST.git`

---

## 🔧 Git 연동 확인

### 현재 Remote 설정
```bash
git remote -v
```

출력:
```
origin  https://ghp_***@github.com/didalsdk-web/test-3D-1101-TEST.git (fetch)
origin  https://ghp_***@github.com/didalsdk-web/test-3D-1101-TEST.git (push)
```

---

## 📝 기본 Git 명령어

### 변경사항 커밋 및 푸시
```bash
# 변경된 파일 확인
git status

# 모든 변경사항 스테이징
git add .

# 커밋
git commit -m "커밋 메시지"

# GitHub에 푸시
git push origin main
```

### 최신 변경사항 가져오기
```bash
# 원격 저장소에서 최신 변경사항 가져오기
git fetch origin

# 현재 브랜치에 병합
git pull origin main
```

---

## 🔒 보안 참고사항

### 현재 설정의 보안 이슈
⚠️ **주의**: Git remote URL에 토큰이 직접 포함되어 있습니다.

**문제점:**
- `git remote -v` 명령어로 토큰이 노출됨
- Git 히스토리에 토큰이 남을 수 있음
- 다른 개발자와 공유 시 토큰 노출 위험

### 더 안전한 방법 (권장)

#### 방법 1: Git Credential Helper 사용
```bash
# Git credential helper 설정
git config --global credential.helper store

# 토큰을 URL에서 제거하고 일반 URL로 변경
git remote set-url origin https://github.com/didalsdk-web/test-3D-1101-TEST.git

# 첫 push 시 토큰 입력 (자동으로 저장됨)
git push origin main
# Username: didalsdk-web
# Password: [YOUR_TOKEN_HERE]
```

#### 방법 2: 환경 변수 사용
```bash
# Windows PowerShell
$env:GIT_TOKEN="[YOUR_TOKEN_HERE]"
git remote set-url origin https://$env:GIT_TOKEN@github.com/didalsdk-web/test-3D-1101-TEST.git

# Linux/Mac
export GIT_TOKEN="[YOUR_TOKEN_HERE]"
git remote set-url origin https://$GIT_TOKEN@github.com/didalsdk-web/test-3D-1101-TEST.git
```

---

## 📦 현재 프로젝트 상태

### 변경된 파일 (아직 커밋되지 않음)
- `.gitignore`
- `index.html`

### 추가된 파일 (아직 커밋되지 않음)
- `API_KEY_STORAGE_GUIDE.md`
- `AUTH_COMPARISON.md`
- `README_TOKEN_AUTH.md`
- `SETUP_TOKEN_SERVER.md`
- `TOKEN_AUTH_GUIDE.md`
- `TOKEN_CHANGE_GUIDE.md`
- `GITHUB_SETUP.md`
- `server.js`
- `package.json`
- `package-lock.json`

### Git에 포함되지 않는 파일
- `env/config.js` (`.gitignore`에 포함)
- `env/serviceAccountKey.json` (`.gitignore`에 포함)
- `node_modules/` (`.gitignore`에 포함)

---

## 🚀 다음 단계

### 1. 변경사항 커밋 및 푸시
```bash
# 모든 파일 스테이징
git add .

# 커밋
git commit -m "GitHub 토큰 설정 및 문서 추가"

# 푸시
git push origin main
```

### 2. GitHub에서 확인
- 저장소 페이지: https://github.com/didalsdk-web/test-3D-1101-TEST
- 커밋이 정상적으로 푸시되었는지 확인

---

## ⚠️ 주의사항

1. **토큰 보안**
   - `env/config.js`는 `.gitignore`에 포함되어 있어 Git에 올라가지 않음
   - 하지만 Git remote URL에 토큰이 포함되어 있으므로 주의 필요

2. **토큰 만료**
   - GitHub Personal Access Token은 만료될 수 있음
   - 토큰이 만료되면 새 토큰을 발급받아 `env/config.js`와 Git remote URL을 업데이트

3. **토큰 권한**
   - 현재 토큰은 저장소에 대한 읽기/쓰기 권한이 필요
   - GitHub에서 토큰 권한 확인: Settings → Developer settings → Personal access tokens

---

## 🔍 토큰 유효성 확인

```bash
# GitHub API로 토큰 확인
curl -H "Authorization: token [YOUR_TOKEN_HERE]" https://api.github.com/user
```

성공 시 사용자 정보가 반환됩니다.

---

## 📚 참고 자료

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Git Credential Helper](https://git-scm.com/docs/git-credential)
- [Git Remote URL](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes)

