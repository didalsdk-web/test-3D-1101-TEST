// 빌드 테스트 스크립트
const fs = require('fs');
const path = require('path');

console.log('=== 빌드 테스트 시작 ===\n');

let errors = [];
let warnings = [];

// 1. 필수 파일 존재 확인
console.log('1. 필수 파일 확인...');
const requiredFiles = [
    'index.html',
    'env/config.js',
    'env/config.example.js'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✓ ${file} 존재`);
    } else {
        errors.push(`  ✗ ${file} 없음`);
        console.log(`  ✗ ${file} 없음`);
    }
});

// 2. index.html 구조 확인
console.log('\n2. index.html 구조 확인...');
try {
    const htmlContent = fs.readFileSync('index.html', 'utf-8');
    
    // 기본 HTML 구조 확인
    const checks = [
        { name: 'DOCTYPE 선언', pattern: /<!DOCTYPE html>/i },
        { name: 'HTML 태그', pattern: /<html/i },
        { name: 'HEAD 태그', pattern: /<head/i },
        { name: 'BODY 태그', pattern: /<body/i },
        { name: '닫는 HTML 태그', pattern: /<\/html>/i }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(htmlContent)) {
            console.log(`  ✓ ${check.name}`);
        } else {
            errors.push(`  ✗ ${check.name} 없음`);
            console.log(`  ✗ ${check.name} 없음`);
        }
    });
    
    // 필수 스크립트 확인
    console.log('\n3. 필수 스크립트 확인...');
    const requiredScripts = [
        { name: 'env/config.js', pattern: /env\/config\.js/ },
        { name: 'Firebase App SDK', pattern: /firebase-app-compat/ },
        { name: 'Firebase Auth SDK', pattern: /firebase-auth-compat/ },
        { name: 'Firebase Firestore SDK', pattern: /firebase-firestore-compat/ }
    ];
    
    requiredScripts.forEach(script => {
        if (script.pattern.test(htmlContent)) {
            console.log(`  ✓ ${script.name}`);
        } else {
            warnings.push(`  ⚠ ${script.name} 없음`);
            console.log(`  ⚠ ${script.name} 없음`);
        }
    });
    
    // 필수 함수 확인
    console.log('\n4. 필수 함수 확인...');
    const requiredFunctions = [
        'initFirebase',
        'handleEmailLogin',
        'handleSignup',
        'handleAdminLogin',
        'checkLoginStatus',
        'openAdminPanel',
        'saveCustomerData',
        'loadCustomerData'
    ];
    
    requiredFunctions.forEach(func => {
        const pattern = new RegExp(`function\\s+${func}|${func}\\s*[:=]\\s*function`);
        if (pattern.test(htmlContent)) {
            console.log(`  ✓ ${func}() 함수`);
        } else {
            warnings.push(`  ⚠ ${func}() 함수 없음`);
            console.log(`  ⚠ ${func}() 함수 없음`);
        }
    });
    
    // HTML 태그 밸런스 확인 (기본)
    console.log('\n5. HTML 태그 밸런스 확인...');
    const openTags = (htmlContent.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (htmlContent.match(/<\/[^>]+>/g) || []).length;
    const selfClosingTags = (htmlContent.match(/<[^>]+\/>/g) || []).length;
    
    // 자체 닫는 태그들 (img, input, br, hr, meta, link 등)
    const voidElements = (htmlContent.match(/<(img|input|br|hr|meta|link|area|base|col|embed|source|track|wbr)[\s>]/gi) || []).length;
    
    const totalSelfClosing = selfClosingTags + voidElements;
    const expectedCloseTags = openTags - totalSelfClosing;
    const balance = Math.abs(closeTags - expectedCloseTags);
    
    if (balance < 20) {
        console.log(`  ✓ 태그 밸런스 정상 (열림: ${openTags}, 닫힘: ${closeTags}, 자체닫힘: ${totalSelfClosing}, 차이: ${balance})`);
    } else {
        warnings.push(`  ⚠ 태그 밸런스 이상 (열림: ${openTags}, 닫힘: ${closeTags}, 차이: ${balance})`);
        console.log(`  ⚠ 태그 밸런스 이상 (열림: ${openTags}, 닫힘: ${closeTags}, 차이: ${balance})`);
    }
    
    // 파일 크기 확인
    const fileSize = fs.statSync('index.html').size;
    console.log(`\n6. 파일 크기: ${(fileSize / 1024).toFixed(2)} KB`);
    if (fileSize > 1024 * 1024) {
        warnings.push('  ⚠ 파일 크기가 1MB를 초과합니다.');
    }
    
} catch (error) {
    errors.push(`index.html 읽기 오류: ${error.message}`);
    console.error(`index.html 읽기 오류: ${error.message}`);
}

// 3. env/config.js 확인
console.log('\n7. env/config.js 설정 확인...');
try {
    const configContent = fs.readFileSync('env/config.js', 'utf-8');
    
    const configChecks = [
        { name: 'FIREBASE 설정', pattern: /FIREBASE:\s*\{/ },
        { name: 'ADMIN 설정', pattern: /ADMIN:\s*\{/ },
        { name: 'apiKey', pattern: /apiKey:/ },
        { name: 'projectId', pattern: /projectId:/ }
    ];
    
    configChecks.forEach(check => {
        if (check.pattern.test(configContent)) {
            console.log(`  ✓ ${check.name}`);
        } else {
            warnings.push(`  ⚠ ${check.name} 없음`);
            console.log(`  ⚠ ${check.name} 없음`);
        }
    });
} catch (error) {
    errors.push(`env/config.js 읽기 오류: ${error.message}`);
    console.error(`env/config.js 읽기 오류: ${error.message}`);
}

// 결과 요약
console.log('\n=== 빌드 테스트 결과 ===');
if (errors.length === 0 && warnings.length === 0) {
    console.log('✓ 모든 테스트 통과!');
    process.exit(0);
} else {
    if (errors.length > 0) {
        console.log(`\n✗ 오류 (${errors.length}개):`);
        errors.forEach(err => console.log(err));
    }
    if (warnings.length > 0) {
        console.log(`\n⚠ 경고 (${warnings.length}개):`);
        warnings.forEach(warn => console.log(warn));
    }
    process.exit(errors.length > 0 ? 1 : 0);
}

