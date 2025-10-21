# 📚 Ignitee 문서 센터

Ignitee 프로젝트의 모든 문서를 한 곳에서 확인하세요.

## 📋 문서 목록

### 🎯 제품 문서
- **[PRD (Product Requirements Document)](./PRD.md)** - 제품 요구사항 및 기능 명세
- **[CHANGELOG](../CHANGELOG.md)** - 버전별 변경사항 및 업데이트 히스토리

### 👨‍💻 개발 문서
- **[개발자 룰 & 가이드라인](./DEVELOPER_RULES.md)** - 코딩 컨벤션, 아키텍처 원칙, Git 워크플로우
- **[아키텍처 구현 문서](./ARCHITECTURE_IMPLEMENTATION.md)** - Clean Architecture + Hexagonal + CQRS + Event-Driven 구현 현황
- **[API 문서](./API.md)** - REST API 및 Edge Functions 명세
- **[배포 가이드](./DEPLOYMENT.md)** - 로컬 개발, 프로덕션 배포, 모니터링
- **[디자인 시스템](./DESIGN_SYSTEM.md)** - 비주얼 디렉션, 컬러 팔레트, 컴포넌트 가이드

### 🚀 빠른 시작

#### 1. 프로젝트 설정
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

#### 2. 로컬 개발
```bash
# Supabase 시작
supabase start

# 웹 앱 실행
pnpm --filter web dev
```

#### 3. 배포
```bash
# Vercel 배포
vercel --prod

# Supabase 배포
supabase functions deploy
```

## 🏗️ 아키텍처 개요

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js Web   │    │   Supabase      │    │   OpenAI API    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (AI Engine)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │   Edge Functions│
│   (Hosting)     │    │   (Serverless)  │
└─────────────────┘    └─────────────────┘
```

## 📦 패키지 구조

```
ignitee/
├─ apps/
│  ├─ web/                  # Next.js 프론트엔드
│  └─ agent/                # LangGraph.js 에이전트
├─ packages/
│  ├─ domain/               # 도메인 엔티티
│  ├─ use-cases/            # 비즈니스 로직
│  ├─ ports/                # 인터페이스 정의
│  ├─ adapters/             # 외부 시스템 연동
│  └─ shared/               # 공통 유틸리티
├─ supabase/
│  ├─ migrations/           # 데이터베이스 스키마
│  └─ functions/           # Edge Functions
└─ docs/                   # 프로젝트 문서
```

## 🔧 기술 스택

### 프론트엔드
- **Next.js 14+** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **App Router** - 라우팅

### 백엔드
- **Supabase** - PostgreSQL, Auth, Storage
- **Edge Functions** - 서버리스 함수
- **RLS** - Row Level Security

### AI & 워크플로우
- **OpenAI GPT-4** - 자연어 처리
- **LangGraph.js** - 워크플로우 오케스트레이션

### 개발 도구
- **pnpm** - 패키지 매니저
- **ESLint** - 코드 품질
- **TypeScript** - 타입 체크

## 🎯 주요 기능

### 1. PRD 분석
- 도메인 자동 분류
- 페르소나 추출
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

## 📊 성능 지표

### 목표 성능
- **응답 시간**: PRD 분석 < 30초
- **가용성**: 99.9% uptime
- **동시 사용자**: 1,000명 지원

### 모니터링
- **Vercel Analytics** - 프론트엔드 성능
- **Supabase Dashboard** - 백엔드 메트릭
- **Sentry** - 에러 추적

## 🔒 보안

### 인증 & 인가
- **Supabase Auth** - 사용자 인증
- **RLS** - 데이터 접근 제어
- **JWT** - 토큰 기반 인증

### 데이터 보호
- **암호화** - 전송 중 및 저장 시
- **입력 검증** - SQL 인젝션 방지
- **Rate Limiting** - API 보호

## 🚀 배포 환경

### 개발 환경
- **로컬**: `localhost:3000`
- **Supabase Local**: `localhost:54321`

### 프로덕션 환경
- **Frontend**: Vercel
- **Backend**: Supabase Cloud
- **CDN**: Vercel Edge Network

## 📈 로드맵

### v1.1.0 (2024-02-15)
- [ ] 콘텐츠 생성 기능 완성
- [ ] 성과 분석 대시보드
- [ ] API 성능 최적화

### v1.2.0 (2024-03-15)
- [ ] 팀 협업 기능
- [ ] 실시간 협업
- [ ] 권한 관리 시스템

### v2.0.0 (2024-06-15)
- [ ] 엔터프라이즈 기능
- [ ] API v2
- [ ] 고급 분석 및 리포팅

## 🤝 기여하기

### 개발 참여
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

### 문서 개선
- 오타 수정
- 내용 보완
- 번역 추가
- 예시 개선

## 📞 지원

### 기술 지원
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Discord**: 실시간 개발자 커뮤니티
- **이메일**: support@ignitee.dev

### 문서 피드백
- **GitHub Discussions**: 문서 개선 제안
- **Pull Request**: 직접 수정 제안

---

**문서 센터 버전**: v1.0  
**최종 업데이트**: 2024-01-15  
**관리자**: Ignitee Documentation Team
