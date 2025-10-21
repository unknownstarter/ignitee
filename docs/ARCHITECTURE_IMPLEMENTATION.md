# 🏗️ Ignitee 아키텍처 구현 문서

**구현 일자**: 2024-01-15  
**문서 버전**: v1.1  
**최종 업데이트**: 2024-12-19  
**구현자**: Ignitee Development Team

## 📋 개요

Ignitee 프로젝트에 권장 아키텍처를 성공적으로 구현했습니다. Clean Architecture + Hexagonal + CQRS + Event-Driven 패턴을 적용하여 확장 가능하고 테스트 가능한 시스템을 구축했습니다.

## 🎯 구현 목표

- **TypeScript 일원화**: 프론트엔드, 백엔드, AI 에이전트 모두 TypeScript 사용
- **클린 아키텍처**: 도메인 중심의 의존성 역전 구조
- **헥사고날 아키텍처**: 포트와 어댑터 패턴으로 외부 의존성 격리
- **CQRS**: 명령과 조회의 분리로 성능 최적화
- **이벤트 드리븐**: 도메인 이벤트 기반의 느슨한 결합
- **멀티 에이전트**: LangGraph 기반의 AI 워크플로우 오케스트레이션

## 🏗️ 아키텍처 구조

### 1. 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Ignitee Platform                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)  │  API (NestJS)  │  Agent Orchestrator │
│  - React UI          │  - REST/GraphQL│  - LangGraph        │
│  - Tailwind CSS      │  - Event Bus   │  - Multi-Agent     │
│  - App Router        │  - CQRS        │  - Workflow        │
├─────────────────────────────────────────────────────────────┤
│                    Domain Layer                             │
│  - Entities          │  - Value Objects │  - Domain Events  │
│  - Domain Services   │  - Business Rules │  - Aggregates     │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│  - Use Cases         │  - Commands     │  - Queries         │
│  - Event Handlers    │  - DTOs         │  - Services        │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│  - Repositories      │  - External APIs │  - Message Queue   │
│  - Database          │  - File Storage  │  - Cache           │
└─────────────────────────────────────────────────────────────┘
```

### 2. 프로젝트 구조

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

## 🔧 구현된 컴포넌트

### 1. NestJS API 서버 (`apps/api`)

#### 구조
```
apps/api/
├─ src/
│  ├─ main.ts              # 애플리케이션 진입점
│  ├─ app.module.ts        # 루트 모듈
│  └─ modules/
│     ├─ project/          # 프로젝트 관리
│     ├─ analysis/         # PRD 분석
│     ├─ strategy/         # 전략 생성
│     ├─ content/         # 콘텐츠 관리
│     ├─ channel/         # 채널 연동
│     └─ metrics/          # 성과 분석
```

#### 주요 기능
- **REST API**: RESTful 엔드포인트 제공
- **GraphQL**: Apollo Server 기반 GraphQL API
- **이벤트 시스템**: EventEmitter 기반 이벤트 처리
- **큐 시스템**: BullMQ 기반 작업 큐
- **검증**: class-validator 기반 입력 검증

#### 설정 파일
- `package.json`: NestJS 의존성 및 스크립트
- `tsconfig.json`: TypeScript 설정
- `nest-cli.json`: NestJS CLI 설정

### 2. Agent Orchestrator 서비스 (`services/agent-orchestrator`) - v1.1 업데이트

#### 새로운 아키텍처 (2024-12-19)
```typescript
// Express.js 기반 단순화된 아키텍처
- Express.js 서버 (포트 3002)
- OpenAI GPT-4 직접 연동
- CORS 설정으로 웹 앱과 통신
- 환경 변수 기반 설정
```

#### 주요 변경사항
- **LangGraph.js 제거**: 호환성 문제로 인한 제거
- **직접 OpenAI 호출**: Supabase Edge Functions 대체
- **일반 채팅 지원**: PRD 분석과 일반 채팅 구분
- **컨텍스트 유지**: 대화 히스토리 기반 응답

#### API 엔드포인트
```typescript
POST /api/analyze          // PRD 분석 및 일반 채팅
POST /api/generate-strategy // 원페이저 전략 생성
POST /api/generate-content  // 실행 캘린더 생성
```

#### AI 역할 설정
```typescript
// 마케팅 전문가 역할
- 마케팅 전문가
- 홍보 전문가  
- PR 전문가
- 커뮤니티 운영 전문가
- 커뮤니티 마케팅 전문가
```

### 3. 도메인 모델 (`packages/domain`)

#### 핵심 엔티티
```typescript
// 6개 핵심 엔티티
- Project: 프로젝트 정보
- Analysis: PRD 분석 결과
- Strategy: GTM 전략
- ContentPlan: 콘텐츠 계획
- ContentItem: 개별 콘텐츠
- Engagement: 참여도 지표
```

#### 도메인 이벤트
```typescript
// 6개 도메인 이벤트
- PRDSubmittedEvent
- AnalysisCompletedEvent
- StrategyGeneratedEvent
- ContentPlanCreatedEvent
- ContentPostedEvent
- MetricsIngestedEvent
```

#### 도메인 서비스
```typescript
// 2개 도메인 서비스
- ContentOptimizationService: 채널별 콘텐츠 최적화
- MetricsAnalysisService: 성과 분석 및 ROI 계산
```

### 4. 포트 인터페이스 (`packages/ports`)

#### LLM 포트
```typescript
interface LLMPort {
  analyzePRD(input: { prd: string }): Promise<AnalysisResult>;
  craftStrategy(input: { analysis: Analysis }): Promise<StrategyResult>;
  draftContent(input: { strategy: Strategy; channel: string }): Promise<ContentDraft[]>;
  generateHooks(input: { channel: string; content: string }): Promise<string[]>;
  generateHashtags(input: { channel: string; content: string }): Promise<string[]>;
  optimizeContent(input: { content: string; channel: string }): Promise<string>;
}
```

#### 채널 포트
```typescript
interface ChannelPort {
  publish(item: ContentDraftDTO): Promise<{ postId: string; url: string }>;
  fetchMetrics(ref: { postId: string }): Promise<EngagementDTO>;
  schedulePost(input: { content: string; scheduledAt: Date }): Promise<{ postId: string }>;
  deletePost(postId: string): Promise<void>;
  updatePost(postId: string, content: string): Promise<void>;
  getPostAnalytics(postId: string): Promise<PostAnalyticsDTO>;
}
```

#### 채널별 어댑터
- **YouTubeAdapter**: 비디오 업로드, 쇼츠 생성
- **InstagramAdapter**: 포토/스토리/릴스 포스팅
- **TikTokAdapter**: 비디오 업로드
- **TwitterAdapter**: 트윗/스레드 포스팅
- **LinkedInAdapter**: 업데이트/아티클 포스팅

### 5. 이벤트 시스템 (`packages/shared`)

#### 이벤트 버스
```typescript
interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}
```

#### 이벤트 스토어
```typescript
interface EventStore {
  save(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsByType(eventType: string): Promise<DomainEvent[]>;
  getEventsSince(timestamp: Date): Promise<DomainEvent[]>;
}
```

#### 이벤트 핸들러 체인
```typescript
PRDSubmittedEvent → AnalysisCompletedEvent → 
StrategyGeneratedEvent → ContentPlanCreatedEvent → 
ContentPostedEvent → MetricsIngestedEvent
```

### 6. 데이터베이스 스키마 (`supabase/migrations`)

#### 핵심 테이블
```sql
-- 6개 핵심 테이블
projects (id, owner_id, name, prd_text, industry, targets)
analysis (id, project_id, domain, personas, pains, solution_map, competitors)
strategy (id, project_id, positioning, key_messages, channel_mix, funnel_hypothesis)
content_plan (id, project_id, calendar, channel_guides, hooks, hashtags)
content_item (id, plan_id, channel, copy, media_prompt, status, external_post_id)
engagement (id, content_item_id, impressions, clicks, ctr, likes, shares, comments, conversions)
```

#### 이벤트 스토어
```sql
-- 이벤트 스토어 테이블
domain_events (id, aggregate_id, event_type, event_data, occurred_on, version)
```

#### 큐 시스템
```sql
-- 작업 큐 테이블
job_queue (id, job_name, data, status, progress, result, error, created_at, processed_at, completed_at)
```

#### 캐시 시스템
```sql
-- 캐시 테이블
cache (key, value, expires_at, created_at)
```

#### 감사 로그
```sql
-- 감사 로그 테이블
audit_log (id, table_name, record_id, action, old_values, new_values, user_id, created_at)
```

## 🚀 실행 방법

### 개발 환경 실행
```bash
# 웹 앱 실행
cd apps/web && npm run dev  # 포트 3001

# Agent Orchestrator 실행
cd services/agent-orchestrator && OPENAI_API_KEY=your_key npm run dev  # 포트 3002

# 또는 개별 실행
pnpm dev                    # 웹 앱 (Next.js)
pnpm dev:api               # API 서버 (NestJS) - Legacy
pnpm dev:agent            # 에이전트 오케스트레이터
```

### 프로덕션 배포
```bash
# 빌드
pnpm build

# 실행
pnpm start                 # 웹 앱
pnpm start:api           # API 서버
pnpm start:agent         # 에이전트 오케스트레이터
```

## 📊 성능 및 확장성

### 성능 지표
- **응답 시간**: PRD 분석 < 30초
- **가용성**: 99.9% uptime
- **동시 사용자**: 1,000명 지원
- **처리량**: 초당 100개 요청 처리

### 확장성 고려사항
- **수평적 확장**: 로드 밸런싱 지원
- **데이터베이스 최적화**: 인덱스 및 파티셔닝
- **캐싱 전략**: Redis 기반 캐싱
- **큐 시스템**: BullMQ 기반 작업 분산

## 🔒 보안 및 권한

### Row Level Security (RLS)
- 사용자별 데이터 격리
- 프로젝트 소유자 기반 접근 제어
- API 키 기반 인증

### 감사 로그
- 모든 데이터 변경 추적
- 사용자별 액션 로그
- 규정 준수 지원

## 🧪 테스트 전략

### 단위 테스트
- 도메인 로직 테스트
- 유스케이스 테스트
- 포트 구현 테스트

### 통합 테스트
- API 엔드포인트 테스트
- 데이터베이스 연동 테스트
- 외부 서비스 연동 테스트

### E2E 테스트
- 전체 워크플로우 테스트
- 사용자 시나리오 테스트
- 성능 테스트

## 📈 모니터링 및 로깅

### 모니터링
- **Vercel Analytics**: 프론트엔드 성능
- **Supabase Dashboard**: 백엔드 메트릭
- **Sentry**: 에러 추적

### 로깅
- **구조화된 로그**: JSON 형태 로그
- **로그 레벨**: DEBUG, INFO, WARN, ERROR
- **중앙 집중 로깅**: ELK 스택 또는 유사 도구

## 🔄 CI/CD 파이프라인

### GitHub Actions
```yaml
# 자동화된 배포 파이프라인
- 코드 품질 검사 (ESLint, TypeScript)
- 테스트 실행 (Jest, Vitest)
- 빌드 및 배포 (Vercel, Supabase)
- 성능 테스트
```

## 📚 문서화

### 기술 문서
- **API 문서**: Swagger/OpenAPI
- **아키텍처 문서**: 이 문서
- **개발자 가이드**: DEVELOPER_RULES.md
- **배포 가이드**: DEPLOYMENT.md
- **디자인 시스템**: DESIGN_SYSTEM.md

### 코드 문서
- **JSDoc**: 함수별 문서화
- **README**: 각 패키지별 사용법
- **예제 코드**: 사용 예시 제공

## 🎯 향후 개선 계획

### v1.1.0 (2024-02-15)
- [ ] Python 서브 에이전트 추가 (무거운 분석 작업용)
- [ ] 고급 캐싱 전략 구현
- [ ] 실시간 대시보드 추가
- [ ] A/B 테스트 기능

### v1.2.0 (2024-03-15)
- [ ] 팀 협업 기능
- [ ] 권한 관리 시스템
- [ ] 워크스페이스 기능
- [ ] 실시간 알림

### v2.0.0 (2024-06-15)
- [ ] 엔터프라이즈 기능
- [ ] API v2
- [ ] 고급 분석 및 리포팅
- [ ] 써드파티 통합 확장

## ✅ 구현 체크리스트

### 아키텍처 패턴
- [x] Clean Architecture 구현
- [x] Hexagonal Architecture (Ports & Adapters)
- [x] CQRS 패턴 적용
- [x] Event-Driven Architecture
- [x] Domain-Driven Design

### 기술 스택
- [x] TypeScript 일원화
- [x] NestJS API 서버
- [x] LangGraph 멀티 에이전트
- [x] Supabase 백엔드
- [x] pnpm 모노레포

### 데이터베이스
- [x] 이벤트 스토어 구현
- [x] RLS 정책 적용
- [x] 인덱스 최적화
- [x] 감사 로그 시스템

### 개발 도구
- [x] ESLint 설정
- [x] TypeScript 설정
- [x] 테스트 환경 구성
- [x] CI/CD 파이프라인

## 📞 지원 및 문의

### 기술 지원
- **GitHub Issues**: [ignitee/issues](https://github.com/ignitee/issues)
- **이메일**: support@ignitee.dev
- **Discord**: 개발자 커뮤니티

### 문서 피드백
- **GitHub Discussions**: 문서 개선 제안
- **Pull Request**: 직접 수정 제안

---

**문서 작성일**: 2024-01-15  
**최종 업데이트**: 2024-12-19  
**문서 작성자**: Ignitee Development Team  
**검토자**: Ignitee Architecture Team

> 💡 **참고**: 이 문서는 Ignitee 프로젝트의 아키텍처 구현 현황을 정리한 것입니다. 지속적인 업데이트가 필요하며, 새로운 기능 추가 시 이 문서도 함께 업데이트해야 합니다.
