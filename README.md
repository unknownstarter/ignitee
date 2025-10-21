# 🚀 Ignitee - PRD to GTM Strategy Platform

**TypeScript 모노레포**로 구축된 **PRD → Go-to-Market 전략** 자동 생성 플랫폼입니다.

## 🏗️ 아키텍처

- **프론트엔드**: Next.js + Tailwind CSS + App Router
- **백엔드**: NestJS (REST/GraphQL) + Supabase (PostgreSQL, Auth, Storage)
- **AI**: LangGraph.js + OpenAI GPT-4 (멀티 에이전트 시스템)
- **아키텍처**: 클린 아키텍처 + 헥사고날 + CQRS + 이벤트 드리븐
- **인프라**: TypeScript 일원화 + pnpm 모노레포

## 📁 프로젝트 구조

```
ignitee/
├─ apps/
│  ├─ web/                  # Next.js 프론트엔드
│  ├─ api/                  # NestJS API (REST/GraphQL)
│  └─ agent/                # LangGraph.js 오케스트레이션 (Legacy)
├─ services/
│  └─ agent-orchestrator/   # 멀티 에이전트 오케스트레이터
├─ packages/
│  ├─ domain/               # 도메인 엔티티 (Clean Architecture)
│  ├─ use-cases/            # 비즈니스 로직 (CQRS)
│  ├─ ports/                # 인터페이스 정의 (Hexagonal)
│  ├─ adapters/             # 외부 시스템 연동
│  └─ shared/               # 공통 유틸리티 + 이벤트 시스템
├─ supabase/
│  ├─ migrations/           # 데이터베이스 스키마
│  └─ functions/            # Edge Functions
└─ docs/                    # 프로젝트 문서
```

## 🚀 빠른 시작

### 1. 필수 도구 설치

```bash
# pnpm 설치 (권장)
npm install -g pnpm

# Supabase CLI 설치
npm install -g supabase
```

### 2. 프로젝트 설정

```bash
# 의존성 설치
pnpm install

# Supabase 초기화
supabase init

# 환경 변수 설정
cp apps/web/env.example apps/web/.env.local
```

### 3. 환경 변수 설정

`apps/web/.env.local` 파일을 편집하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=your_supabase_url/functions/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

루트 `.env` 파일 생성:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your_openai_api_key
```

### 4. 데이터베이스 설정

```bash
# 로컬 Supabase 시작
supabase start

# 또는 클라우드 Supabase 사용
supabase db push
```

### 5. Edge Functions 배포

```bash
# Edge Functions 배포
supabase functions deploy analyze-prd
supabase functions deploy generate-strategy
supabase functions deploy generate-content
```

### 6. 앱 실행

```bash
# 모든 서비스 실행 (권장)
pnpm dev:all

# 또는 개별 실행
pnpm dev                    # 웹 앱 (Next.js)
pnpm dev:api               # API 서버 (NestJS)
pnpm dev:agent            # 에이전트 오케스트레이터
```

## 🎯 주요 기능

### 1. PRD 분석
- 도메인 식별
- 페르소나 분석
- 페인포인트 매핑
- 솔루션 매핑

### 2. GTM 전략 생성
- 포지셔닝 전략
- 핵심 메시지 개발
- 채널 믹스 계획
- 콘텐츠 전략

### 3. 콘텐츠 생성
- 플랫폼별 맞춤 콘텐츠
- 해시태그 제안
- CTA 최적화
- 발행 일정 관리

### 4. 피드백 분석
- 성과 메트릭 추적
- 인사이트 도출
- 개선 추천사항

## 🛠️ 개발 가이드

### 패키지 구조

#### Domain Layer (`packages/domain`)
```typescript
// 엔티티 정의
export type Project = {
  id: string;
  ownerId: string;
  name: string;
  prd: string;
  createdAt: string;
};
```

#### Use Cases Layer (`packages/use-cases`)
```typescript
// 비즈니스 로직
export class SubmitPrdUseCase {
  async execute(input: SubmitPrdInput): Promise<SubmitPrdOutput> {
    // 비즈니스 로직 구현
  }
}
```

#### Ports Layer (`packages/ports`)
```typescript
// 인터페이스 정의
export interface LlmPort {
  analyzePRD(prd: string): Promise<Analysis>;
  craftStrategy(analysis: Analysis): Promise<Strategy>;
}
```

#### Adapters Layer (`packages/adapters`)
```typescript
// 외부 시스템 연동
export class SupabaseProjectRepo implements ProjectRepo {
  // Supabase 구현
}
```

### API 엔드포인트

#### 웹 API
- `POST /api/analyze` - PRD 분석
- `POST /api/strategy` - 전략 생성
- `POST /api/content` - 콘텐츠 생성

#### Edge Functions
- `POST /functions/v1/analyze-prd` - PRD 분석
- `POST /functions/v1/generate-strategy` - 전략 생성
- `POST /functions/v1/generate-content` - 콘텐츠 생성

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- `projects` - 프로젝트 정보
- `analysis` - PRD 분석 결과
- `strategy` - GTM 전략
- `content` - 생성된 콘텐츠
- `feedback` - 성과 피드백

### RLS (Row Level Security)
- 사용자별 데이터 격리
- 소유자 기반 접근 제어
- API 키 기반 인증

## 🔧 개발 명령어

```bash
# 전체 의존성 설치
pnpm install

# 웹 앱 개발 서버
pnpm --filter web dev

# 에이전트 개발 서버
pnpm --filter agent dev

# 빌드
pnpm --filter web build
pnpm --filter agent build

# 린트
pnpm --filter web lint
```

## 🚀 배포

### Vercel (웹 앱)
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

### Supabase (백엔드)
```bash
# Edge Functions 배포
supabase functions deploy

# 데이터베이스 마이그레이션
supabase db push
```

## 📊 모니터링

### 로그 확인
```bash
# Supabase 로그
supabase functions logs

# Vercel 로그
vercel logs
```

### 성능 메트릭
- API 응답 시간
- 데이터베이스 쿼리 성능
- Edge Function 실행 시간

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🆘 문제 해결

### 일반적인 문제

1. **의존성 설치 실패**
   ```bash
   # 캐시 정리
   pnpm store prune
   rm -rf node_modules
   pnpm install
   ```

2. **Supabase 연결 실패**
   - 환경 변수 확인
   - Supabase 프로젝트 상태 확인
   - 네트워크 연결 확인

3. **Edge Function 오류**
   ```bash
   # 로그 확인
   supabase functions logs analyze-prd
   ```

### 지원

- GitHub Issues
- Discord 커뮤니티
- 이메일: support@ignitee.dev

---

**Ignitee**로 더 나은 GTM 전략을 만들어보세요! 🚀
