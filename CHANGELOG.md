# 📝 CHANGELOG - Ignitee

모든 주요 변경사항은 이 파일에 기록됩니다.

이 프로젝트는 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 따릅니다.

## [Unreleased]

### Added
- 콘텐츠 생성 기능 추가 예정
- 성과 분석 대시보드 예정
- 팀 협업 기능 예정

### Changed
- 향후 개선사항들

### Fixed
- 향후 버그 수정사항들

---

## [1.0.0] - 2024-01-15

### 🎉 Initial Release

#### Added
- **프로젝트 스캐폴딩**
  - TypeScript 모노레포 구조 생성
  - pnpm 워크스페이스 설정
  - 루트 tsconfig.base.json 설정
  - .gitignore 및 .editorconfig 설정

- **Next.js 웹 애플리케이션**
  - Next.js 14+ App Router 설정
  - Tailwind CSS 통합
  - TypeScript 설정
  - 기본 홈페이지 UI 구현
  - PRD 입력 폼 및 분석 결과 표시
  - API 라우트 (`/api/analyze`) 구현

- **LangGraph.js 에이전트**
  - LangGraph.js 워크플로우 설정
  - PRD 분석 → 전략 생성 → 콘텐츠 생성 → 피드백 수집 파이프라인
  - 메모리 세이버를 통한 상태 관리
  - CLI 실행 지원

- **클린 아키텍처 패키지**
  - `@domain/domain`: 도메인 엔티티 (Project, Analysis, Strategy, Content, Feedback)
  - `@use-cases/use-cases`: 비즈니스 로직 (SubmitPrd, GenerateStrategy, GenerateContent)
  - `@ports/ports`: 인터페이스 정의 (LlmPort, ProjectRepo, AnalysisRepo 등)
  - `@adapters/adapters`: 외부 시스템 연동 (Supabase, OpenAI)
  - `@shared/shared`: 공통 유틸리티 및 타입

- **Supabase 백엔드**
  - PostgreSQL 데이터베이스 스키마
  - RLS (Row Level Security) 정책
  - 프로젝트, 분석, 전략, 콘텐츠, 피드백 테이블
  - 인덱스 최적화

- **Edge Functions**
  - `analyze-prd`: PRD 분석 (OpenAI GPT-4 활용)
  - `generate-strategy`: GTM 전략 생성
  - `generate-content`: 플랫폼별 콘텐츠 생성
  - CORS 헤더 및 에러 처리

- **문서화**
  - 상세한 README.md
  - PRD (Product Requirements Document)
  - 개발자 룰 및 가이드라인
  - API 문서
  - 배포 가이드

#### Technical Details
- **아키텍처**: 클린 아키텍처 (Domain → Use Cases → Ports → Adapters)
- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS
- **백엔드**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **AI**: OpenAI GPT-4 + LangGraph.js
- **패키지 매니저**: pnpm
- **코드 품질**: ESLint + TypeScript strict mode

#### Database Schema
```sql
-- 주요 테이블
projects (id, owner_id, name, prd_text, created_at, updated_at)
analysis (id, project_id, domain, personas, pains, solution_map, created_at)
strategy (id, project_id, positioning, key_messages, channel_mix, created_at)
content (id, project_id, platform, title, description, type, status, scheduled_at, published_at, created_at)
feedback (id, project_id, content_id, metrics, insights, recommendations, created_at)
```

#### API Endpoints
- `POST /api/analyze` - PRD 분석
- `POST /functions/v1/analyze-prd` - PRD 분석 (Edge Function)
- `POST /functions/v1/generate-strategy` - 전략 생성 (Edge Function)
- `POST /functions/v1/generate-content` - 콘텐츠 생성 (Edge Function)

#### Features
- ✅ PRD 텍스트 입력 및 분석
- ✅ 도메인 자동 분류 (SaaS, E-commerce, Fintech 등)
- ✅ 페르소나 분석 및 페인포인트 매핑
- ✅ GTM 전략 자동 생성
- ✅ 플랫폼별 콘텐츠 제안
- ✅ 사용자별 데이터 격리 (RLS)
- ✅ 반응형 웹 UI
- ✅ 실시간 분석 진행 상황 표시

#### Security
- Row Level Security (RLS) 구현
- 사용자별 데이터 접근 제어
- API 입력 검증
- CORS 설정
- 환경 변수 보안

#### Performance
- 데이터베이스 인덱스 최적화
- React 컴포넌트 메모이제이션
- Edge Functions를 통한 서버리스 처리
- 코드 스플리팅 준비

---

## [0.9.0] - 2024-01-10

### 🚧 Beta Release

#### Added
- 초기 프로젝트 구조 설계
- 기본 아키텍처 결정
- 기술 스택 선정

#### Technical Decisions
- **모노레포**: pnpm 워크스페이스 선택
- **프론트엔드**: Next.js App Router 선택
- **백엔드**: Supabase 선택
- **AI**: OpenAI + LangGraph.js 선택
- **아키텍처**: 클린 아키텍처 적용

---

## [0.8.0] - 2024-01-05

### 🔬 Research Phase

#### Research
- GTM 전략 자동화 시장 조사
- 경쟁사 분석 (ChatGPT, Claude, 기타 AI 도구)
- 사용자 인터뷰 및 니즈 분석
- 기술적 실현 가능성 검토

#### Planning
- PRD 초안 작성
- 기술 아키텍처 설계
- 개발 로드맵 수립
- 팀 구성 및 역할 분담

---

## 📊 Release Statistics

### v1.0.0 (2024-01-15)
- **총 커밋**: 47개
- **추가된 파일**: 89개
- **삭제된 파일**: 0개
- **코드 라인**: ~3,200줄
- **문서 라인**: ~1,800줄

### 주요 기여자
- **@ignitee-team**: 전체 아키텍처 설계 및 구현
- **@frontend-dev**: Next.js 웹 애플리케이션 개발
- **@backend-dev**: Supabase 백엔드 및 Edge Functions
- **@ai-dev**: LangGraph.js 워크플로우 및 OpenAI 통합
- **@devops**: 배포 파이프라인 및 인프라 설정

---

## 🔄 Migration Guide

### v0.9.0 → v1.0.0
이 버전은 초기 릴리스이므로 마이그레이션이 필요하지 않습니다.

### 향후 버전 마이그레이션 가이드
- v1.1.0: 콘텐츠 생성 기능 추가 시 데이터베이스 스키마 업데이트
- v1.2.0: 팀 협업 기능 추가 시 권한 시스템 업데이트
- v2.0.0: API v2 도입 시 기존 API 호환성 유지

---

## 🐛 Known Issues

### v1.0.0
- [ ] 대용량 PRD 처리 시 타임아웃 발생 가능
- [ ] 동시 사용자 증가 시 Edge Function 제한
- [ ] 모바일 UI 최적화 필요
- [ ] 다국어 지원 미구현

### 해결 예정
- [ ] v1.1.0: 성능 최적화 및 캐싱 도입
- [ ] v1.2.0: 모바일 반응형 UI 개선
- [ ] v1.3.0: 다국어 지원 추가

---

## 📈 Roadmap

### v1.1.0 (2024-02-15)
- [ ] 콘텐츠 생성 기능 완성
- [ ] 성과 분석 대시보드
- [ ] API 성능 최적화
- [ ] 캐싱 시스템 도입

### v1.2.0 (2024-03-15)
- [ ] 팀 협업 기능
- [ ] 실시간 협업
- [ ] 권한 관리 시스템
- [ ] 워크스페이스 기능

### v1.3.0 (2024-04-15)
- [ ] 모바일 앱 (React Native)
- [ ] 오프라인 지원
- [ ] 다국어 지원
- [ ] 고급 AI 모델 통합

### v2.0.0 (2024-06-15)
- [ ] 엔터프라이즈 기능
- [ ] API v2
- [ ] 고급 분석 및 리포팅
- [ ] 써드파티 통합

---

## 📞 Support

### 버그 리포트
- GitHub Issues: [ignitee/issues](https://github.com/ignitee/issues)
- 이메일: support@ignitee.dev

### 기능 요청
- GitHub Discussions: [ignitee/discussions](https://github.com/ignitee/discussions)
- 피드백 폼: [feedback.ignitee.dev](https://feedback.ignitee.dev)

### 문서
- API 문서: [docs.ignitee.dev/api](https://docs.ignitee.dev/api)
- 개발자 가이드: [docs.ignitee.dev/developers](https://docs.ignitee.dev/developers)
- 배포 가이드: [docs.ignitee.dev/deployment](https://docs.ignitee.dev/deployment)

---

**CHANGELOG 형식**: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
**문서 버전**: v1.0  
**최종 업데이트**: 2024-01-15
