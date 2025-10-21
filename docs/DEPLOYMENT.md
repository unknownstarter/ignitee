# 🚀 배포 가이드 - Ignitee

## 📋 목차
1. [개요](#1-개요)
2. [로컬 개발 환경](#2-로컬-개발-환경)
3. [Supabase 설정](#3-supabase-설정)
4. [프로덕션 배포](#4-프로덕션-배포)
5. [모니터링](#5-모니터링)
6. [백업 및 복구](#6-백업-및-복구)
7. [트러블슈팅](#7-트러블슈팅)

## 1. 개요

Ignitee는 다음과 같은 구성 요소로 배포됩니다:

- **프론트엔드**: Vercel (Next.js)
- **백엔드**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI**: OpenAI API
- **CDN**: Vercel Edge Network

## 2. 로컬 개발 환경

### 2.1 필수 도구 설치

```bash
# Node.js (v18+)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# pnpm
npm install -g pnpm

# Supabase CLI
npm install -g supabase

# Vercel CLI (선택사항)
npm install -g vercel
```

### 2.2 프로젝트 설정

```bash
# 저장소 클론
git clone https://github.com/your-org/ignitee.git
cd ignitee

# 의존성 설치
pnpm install

# 환경 변수 설정
cp env.example .env
cp apps/web/env.example apps/web/.env.local
```

### 2.3 로컬 Supabase 실행

```bash
# Supabase 초기화
supabase init

# 로컬 Supabase 시작
supabase start

# 데이터베이스 마이그레이션
supabase db push

# Edge Functions 배포
supabase functions deploy analyze-prd
supabase functions deploy generate-strategy
supabase functions deploy generate-content
```

### 2.4 개발 서버 실행

```bash
# 웹 앱 개발 서버
pnpm --filter web dev

# 에이전트 개발 서버 (선택사항)
pnpm --filter agent dev
```

## 3. Supabase 설정

### 3.1 Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `ignitee-production`
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: 가장 가까운 리전 선택

### 3.2 환경 변수 설정

#### 프로덕션 환경 변수
```bash
# .env (루트)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key
```

#### 웹 앱 환경 변수
```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3.3 데이터베이스 설정

```bash
# Supabase CLI로 프로덕션 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push

# Edge Functions 배포
supabase functions deploy analyze-prd --project-ref your-project-ref
supabase functions deploy generate-strategy --project-ref your-project-ref
supabase functions deploy generate-content --project-ref your-project-ref
```

### 3.4 RLS 정책 확인

```sql
-- 프로덕션에서 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### 3.5 인증 설정

```bash
# Supabase Dashboard에서 인증 설정
# Settings > Authentication > Auth Providers
# - Email 확인: 활성화
# - OAuth 제공자: 필요시 설정
```

## 4. 프로덕션 배포

### 4.1 Vercel 배포

#### 4.1.1 Vercel CLI 사용

```bash
# Vercel 로그인
vercel login

# 프로젝트 배포
vercel --prod

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 4.1.2 Vercel Dashboard 사용

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Import Project" 클릭
3. GitHub 저장소 연결
4. 빌드 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm --filter web build`
   - **Output Directory**: `.next`

#### 4.1.3 환경 변수 설정

Vercel Dashboard에서 다음 환경 변수 설정:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4.2 도메인 설정

#### 4.2.1 커스텀 도메인

```bash
# Vercel CLI로 도메인 추가
vercel domains add your-domain.com

# DNS 설정
# A 레코드: 76.76.19.61
# CNAME: cname.vercel-dns.com
```

#### 4.2.2 SSL 인증서

Vercel에서 자동으로 SSL 인증서 발급 및 관리

### 4.3 CI/CD 파이프라인

#### 4.3.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm --filter web build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: apps/web
```

#### 4.3.2 환경별 배포

```bash
# 개발 환경
vercel --env development

# 스테이징 환경
vercel --env preview

# 프로덕션 환경
vercel --env production
```

## 5. 모니터링

### 5.1 애플리케이션 모니터링

#### 5.1.1 Vercel Analytics

```typescript
// apps/web/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### 5.1.2 Sentry 통합

```bash
# Sentry 패키지 설치
pnpm add @sentry/nextjs

# Sentry 설정
npx @sentry/wizard -i nextjs
```

```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```

### 5.2 데이터베이스 모니터링

#### 5.2.1 Supabase Dashboard

- **Database**: 쿼리 성능, 연결 수, 저장 공간
- **Auth**: 사용자 수, 로그인 통계
- **Storage**: 파일 업로드, 저장 공간
- **Edge Functions**: 실행 시간, 에러율

#### 5.2.2 커스텀 모니터링

```typescript
// 성능 메트릭 수집
export async function trackPerformance(operation: string, duration: number) {
  await fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation,
      duration,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

### 5.3 로그 관리

#### 5.3.1 Vercel 로그

```bash
# 실시간 로그 확인
vercel logs --follow

# 특정 함수 로그
vercel logs --filter=api/analyze
```

#### 5.3.2 Supabase 로그

```bash
# Edge Functions 로그
supabase functions logs analyze-prd

# 데이터베이스 로그
supabase db logs
```

## 6. 백업 및 복구

### 6.1 데이터베이스 백업

#### 6.1.1 자동 백업

```bash
# Supabase CLI로 백업
supabase db dump --file backup-$(date +%Y%m%d).sql

# 스크립트로 자동 백업
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
supabase db dump --file "backup_${DATE}.sql"
aws s3 cp "backup_${DATE}.sql" s3://your-backup-bucket/
```

#### 6.1.2 복구

```bash
# 백업에서 복구
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres -f backup-20240115.sql
```

### 6.2 파일 백업

```bash
# Supabase Storage 백업
supabase storage download --bucket=your-bucket --local-path=./backup/storage/
```

### 6.3 환경 변수 백업

```bash
# 환경 변수 백업
vercel env pull .env.backup
```

## 7. 트러블슈팅

### 7.1 일반적인 문제

#### 7.1.1 빌드 실패

```bash
# 의존성 문제
rm -rf node_modules pnpm-lock.yaml
pnpm install

# TypeScript 오류
pnpm --filter web type-check

# 캐시 문제
vercel --force
```

#### 7.1.2 데이터베이스 연결 실패

```bash
# 연결 확인
supabase status

# 재시작
supabase stop
supabase start

# 마이그레이션 재실행
supabase db reset
supabase db push
```

#### 7.1.3 Edge Functions 오류

```bash
# 로그 확인
supabase functions logs analyze-prd

# 재배포
supabase functions deploy analyze-prd --no-verify-jwt
```

### 7.2 성능 문제

#### 7.2.1 느린 응답 시간

```typescript
// 캐싱 추가
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getCachedAnalysis(prd: string) {
  const cacheKey = `analysis:${hash(prd)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = await analyzePRD(prd);
  await redis.setex(cacheKey, 3600, JSON.stringify(result));
  
  return result;
}
```

#### 7.2.2 메모리 사용량 증가

```typescript
// 메모리 사용량 모니터링
export function trackMemoryUsage() {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
  });
}
```

### 7.3 보안 문제

#### 7.3.1 RLS 정책 확인

```sql
-- RLS 활성화 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 정책 확인
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

#### 7.3.2 API 키 보안

```bash
# 환경 변수 확인
vercel env ls

# 민감한 정보 로그 제거
grep -r "console.log" apps/web/src/
```

### 7.4 디버깅 도구

#### 7.4.1 개발자 도구

```typescript
// 디버그 모드
const DEBUG = process.env.NODE_ENV === 'development';

export function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}
```

#### 7.4.2 에러 추적

```typescript
// 에러 경계
export class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Sentry에 에러 전송
  }
}
```

## 8. 확장성 고려사항

### 8.1 수평적 확장

```typescript
// 로드 밸런싱
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'lhr1'],
};
```

### 8.2 데이터베이스 최적화

```sql
-- 인덱스 최적화
CREATE INDEX CONCURRENTLY idx_projects_owner_created 
ON projects(owner_id, created_at DESC);

-- 파티셔닝 (대용량 데이터)
CREATE TABLE projects_2024 PARTITION OF projects
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 8.3 캐싱 전략

```typescript
// Redis 캐싱
export class CacheService {
  private redis: Redis;
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

---

**문서 버전**: v1.0  
**최종 업데이트**: 2024-01-15  
**작성자**: Ignitee DevOps Team
