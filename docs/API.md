# 🔌 API Documentation - Ignitee

## 📋 목차
1. [개요](#1-개요)
2. [인증](#2-인증)
3. [웹 API](#3-웹-api)
4. [Edge Functions](#4-edge-functions)
5. [데이터 모델](#5-데이터-모델)
6. [에러 처리](#6-에러-처리)
7. [Rate Limiting](#7-rate-limiting)
8. [SDK](#8-sdk)

## 1. 개요

Ignitee API는 PRD 분석부터 GTM 전략 생성까지의 전체 워크플로우를 제공합니다.

### Base URLs
- **웹 API**: `https://your-domain.com/api`
- **Edge Functions**: `https://your-project.supabase.co/functions/v1`

### API 버전
현재 API 버전: `v1`

## 2. 인증

### 2.1 Supabase Auth
```typescript
// 클라이언트 사이드 인증
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### 2.2 API 키 인증
```bash
# Edge Functions 호출 시
curl -X POST \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://your-project.supabase.co/functions/v1/analyze-prd
```

## 3. 웹 API

### 3.1 PRD 분석

#### `POST /api/analyze`

PRD 텍스트를 분석하여 도메인, 페르소나, 페인포인트를 추출합니다.

**Request**
```typescript
interface AnalyzeRequest {
  prd: string;  // 분석할 PRD 텍스트 (최소 50자, 최대 10,000자)
}
```

**Response**
```typescript
interface AnalyzeResponse {
  domain: string;           // 제품 도메인 (예: "Creator SaaS")
  personas: Persona[];      // 타겟 페르소나 배열
  pains: string[];          // 고객 페인포인트 배열
  solutionMap: SolutionMapping[];  // 솔루션 매핑
}

interface Persona {
  name: string;             // 페르소나 이름
  description: string;      // 페르소나 설명
  pain: string;            // 주요 페인포인트
  need: string;            // 핵심 니즈
  behavior: string[];       // 행동 패턴
}

interface SolutionMapping {
  pain: string;            // 페인포인트
  solution: string;        // 해결책
  priority: 'high' | 'medium' | 'low';  // 우선순위
}
```

**Example**
```bash
curl -X POST https://your-domain.com/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prd": "SaaS product for content creators to manage their social media presence..."
  }'
```

**Response Example**
```json
{
  "domain": "Creator SaaS",
  "personas": [
    {
      "name": "초보 크리에이터",
      "description": "소셜미디어를 시작한 지 1-2년 된 크리에이터",
      "pain": "콘텐츠 기획과 일정 관리의 어려움",
      "need": "체계적인 콘텐츠 관리 도구",
      "behavior": ["매일 소셜미디어 체크", "트렌드 팔로우"]
    }
  ],
  "pains": [
    "콘텐츠 기획 어려움",
    "일정 관리 복잡성",
    "성과 측정 부족"
  ],
  "solutionMap": [
    {
      "pain": "콘텐츠 기획 어려움",
      "solution": "AI 기반 콘텐츠 아이디어 생성",
      "priority": "high"
    }
  ]
}
```

### 3.2 전략 생성

#### `POST /api/strategy`

분석 결과를 바탕으로 GTM 전략을 생성합니다.

**Request**
```typescript
interface StrategyRequest {
  analysis: AnalyzeResponse;  // 분석 결과
}
```

**Response**
```typescript
interface StrategyResponse {
  positioning: Positioning;
  keyMessages: KeyMessage[];
  channelMix: ChannelStrategy[];
}

interface Positioning {
  target: string;           // 타겟 고객
  benefit: string;          // 핵심 가치 제안
  differentiation: string;  // 차별화 포인트
  proof: string[];          // 증명 요소
}

interface KeyMessage {
  message: string;          // 핵심 메시지
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative';
  useCase: string;          // 사용 사례
}

interface ChannelStrategy {
  channel: string;          // 채널명
  strategy: string;         // 채널 전략
  contentTypes: string[];  // 콘텐츠 타입
  frequency: string;        // 발행 빈도
  goals: string[];          // 목표
}
```

### 3.3 콘텐츠 생성

#### `POST /api/content`

전략을 바탕으로 플랫폼별 콘텐츠를 생성합니다.

**Request**
```typescript
interface ContentRequest {
  strategy: StrategyResponse;
  platform: string;        // 'youtube' | 'instagram' | 'tiktok' | 'linkedin'
  count?: number;          // 생성할 콘텐츠 수 (기본값: 5)
}
```

**Response**
```typescript
interface ContentResponse {
  contents: Content[];
}

interface Content {
  platform: string;
  title: string;
  description: string;
  type: 'educational' | 'entertainment' | 'behind-scenes' | 'promotional';
  hashtags: string[];
  callToAction: string;
}
```

## 4. Edge Functions

### 4.1 PRD 분석

#### `POST /functions/v1/analyze-prd`

**Request**
```typescript
interface AnalyzePRDRequest {
  prd: string;
}
```

**Response**
```typescript
interface AnalyzePRDResponse {
  domain: string;
  personas: Persona[];
  pains: string[];
  solutionMap: SolutionMapping[];
}
```

**Example**
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/analyze-prd \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prd": "Your PRD content here..."}'
```

### 4.2 전략 생성

#### `POST /functions/v1/generate-strategy`

**Request**
```typescript
interface GenerateStrategyRequest {
  analysis: AnalyzePRDResponse;
}
```

**Response**
```typescript
interface GenerateStrategyResponse {
  positioning: Positioning;
  keyMessages: KeyMessage[];
  channelMix: ChannelStrategy[];
}
```

### 4.3 콘텐츠 생성

#### `POST /functions/v1/generate-content`

**Request**
```typescript
interface GenerateContentRequest {
  strategy: GenerateStrategyResponse;
  platform: string;
  count?: number;
}
```

**Response**
```typescript
interface GenerateContentResponse {
  contents: Content[];
}
```

## 5. 데이터 모델

### 5.1 프로젝트 (Project)
```typescript
interface Project {
  id: string;              // UUID
  ownerId: string;         // 소유자 ID
  name: string;            // 프로젝트명
  prd: string;             // PRD 텍스트
  createdAt: string;       // 생성일시 (ISO 8601)
  updatedAt?: string;      // 수정일시 (ISO 8601)
}
```

### 5.2 분석 (Analysis)
```typescript
interface Analysis {
  id: string;              // UUID
  projectId: string;       // 프로젝트 ID
  domain: string;          // 도메인
  personas: Persona[];     // 페르소나
  pains: string[];         // 페인포인트
  solutionMap: SolutionMapping[];  // 솔루션 매핑
  createdAt: string;       // 생성일시
}
```

### 5.3 전략 (Strategy)
```typescript
interface Strategy {
  id: string;              // UUID
  projectId: string;       // 프로젝트 ID
  positioning: Positioning;
  keyMessages: KeyMessage[];
  channelMix: ChannelStrategy[];
  createdAt: string;       // 생성일시
}
```

### 5.4 콘텐츠 (Content)
```typescript
interface Content {
  id: string;              // UUID
  projectId: string;       // 프로젝트 ID
  platform: string;        // 플랫폼
  title: string;           // 제목
  description: string;     // 설명
  type: ContentType;       // 타입
  status: ContentStatus;   // 상태
  scheduledAt?: string;    // 예약일시
  publishedAt?: string;    // 발행일시
  createdAt: string;       // 생성일시
}

type ContentType = 'educational' | 'entertainment' | 'behind-scenes' | 'promotional';
type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';
```

### 5.5 피드백 (Feedback)
```typescript
interface Feedback {
  id: string;              // UUID
  projectId: string;        // 프로젝트 ID
  contentId?: string;      // 콘텐츠 ID (선택사항)
  metrics: Metrics;        // 메트릭
  insights: string[];      // 인사이트
  recommendations: string[];  // 추천사항
  createdAt: string;       // 생성일시
}

interface Metrics {
  views: number;           // 조회수
  engagement: number;      // 참여율
  conversion: number;      // 전환율
  reach: number;          // 도달수
  clicks?: number;         // 클릭수
  shares?: number;         // 공유수
  comments?: number;       // 댓글수
}
```

## 6. 에러 처리

### 6.1 HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 요청 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 오류 |

### 6.2 에러 응답 형식

```typescript
interface ErrorResponse {
  error: string;           // 에러 메시지
  code?: string;         // 에러 코드
  details?: any;          // 상세 정보
  timestamp: string;       // 발생 시간
}
```

### 6.3 에러 예시

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "prd",
    "message": "PRD must be at least 50 characters"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 100,
    "remaining": 0,
    "resetTime": "2024-01-15T11:00:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 7. Rate Limiting

### 7.1 제한 사항

| 엔드포인트 | 제한 | 기간 |
|-----------|------|------|
| `/api/analyze` | 10회 | 1시간 |
| `/api/strategy` | 20회 | 1시간 |
| `/api/content` | 50회 | 1시간 |
| Edge Functions | 100회 | 1시간 |

### 7.2 Rate Limit 헤더

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

### 7.3 Rate Limit 초과 시

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 100,
    "remaining": 0,
    "resetTime": "2024-01-15T11:00:00Z"
  }
}
```

## 8. SDK

### 8.1 TypeScript SDK

```typescript
import { IgniteeClient } from '@ignitee/sdk';

const client = new IgniteClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api'
});

// PRD 분석
const analysis = await client.analyze({
  prd: 'Your PRD content...'
});

// 전략 생성
const strategy = await client.generateStrategy({
  analysis: analysis
});

// 콘텐츠 생성
const contents = await client.generateContent({
  strategy: strategy,
  platform: 'youtube',
  count: 5
});
```

### 8.2 JavaScript SDK

```javascript
const { IgniteeClient } = require('@ignitee/sdk');

const client = new IgniteClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api'
});

// 사용 예시
async function analyzePRD(prd) {
  try {
    const result = await client.analyze({ prd });
    console.log('Analysis result:', result);
    return result;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}
```

### 8.3 Python SDK

```python
from ignitee import IgniteeClient

client = IgniteeClient(
    api_key='your-api-key',
    base_url='https://your-domain.com/api'
)

# PRD 분석
analysis = client.analyze(prd="Your PRD content...")

# 전략 생성
strategy = client.generate_strategy(analysis=analysis)

# 콘텐츠 생성
contents = client.generate_content(
    strategy=strategy,
    platform='youtube',
    count=5
)
```

## 9. 웹훅 (Webhooks)

### 9.1 웹훅 이벤트

| 이벤트 | 설명 | 페이로드 |
|--------|------|----------|
| `analysis.completed` | 분석 완료 | `{ projectId, analysisId }` |
| `strategy.generated` | 전략 생성 완료 | `{ projectId, strategyId }` |
| `content.created` | 콘텐츠 생성 완료 | `{ projectId, contentIds }` |

### 9.2 웹훅 설정

```typescript
// 웹훅 엔드포인트 설정
app.post('/webhook/ignitee', (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'analysis.completed':
      handleAnalysisCompleted(data);
      break;
    case 'strategy.generated':
      handleStrategyGenerated(data);
      break;
    case 'content.created':
      handleContentCreated(data);
      break;
  }
  
  res.status(200).json({ received: true });
});
```

## 10. 테스트

### 10.1 Postman Collection

[Ignitee API Postman Collection](https://www.postman.com/ignitee/workspace/ignitee-api)

### 10.2 cURL 예시

```bash
# PRD 분석
curl -X POST https://your-domain.com/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prd": "Your PRD content..."}'

# 전략 생성
curl -X POST https://your-domain.com/api/strategy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"analysis": {...}}'
```

### 10.3 테스트 데이터

```json
{
  "testPRD": "SaaS product for content creators to manage their social media presence. Features include content scheduling, analytics, and collaboration tools. Target audience: individual creators and small creator teams.",
  "expectedDomain": "Creator SaaS",
  "expectedPersonas": [
    {
      "name": "Individual Creator",
      "pain": "Content scheduling complexity",
      "need": "Simple scheduling tool"
    }
  ]
}
```

---

**API 버전**: v1.0  
**최종 업데이트**: 2024-01-15  
**문서 작성자**: Ignitee API Team
