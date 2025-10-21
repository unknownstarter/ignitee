# 👨‍💻 개발자 룰 & 가이드라인 - Ignite

## 📋 목차
1. [코딩 컨벤션](#1-코딩-컨벤션)
2. [아키텍처 원칙](#2-아키텍처-원칙)
3. [Git 워크플로우](#3-git-워크플로우)
4. [코드 리뷰 가이드](#4-코드-리뷰-가이드)
5. [테스트 전략](#5-테스트-전략)
6. [성능 가이드라인](#6-성능-가이드라인)
7. [보안 체크리스트](#7-보안-체크리스트)
8. [문서화 규칙](#8-문서화-규칙)

## 1. 코딩 컨벤션

### 1.1 TypeScript 규칙

#### 네이밍 컨벤션
```typescript
// ✅ 좋은 예
const userRepository = new UserRepository();
const API_ENDPOINTS = { USERS: '/api/users' };
type UserProfile = { id: string; name: string; };

// ❌ 나쁜 예
const userRepo = new UserRepo();
const apiEndpoints = { users: '/api/users' };
type userProfile = { id: string; name: string; };
```

#### 함수 작성 규칙
```typescript
// ✅ 좋은 예 - 명확한 함수명과 타입
async function createUserProfile(input: CreateUserInput): Promise<UserProfile> {
  const validation = validateUserInput(input);
  if (!validation.isValid) {
    throw new ValidationError(validation.errors);
  }
  
  return await userRepository.create(input);
}

// ❌ 나쁜 예
async function createUser(data: any): Promise<any> {
  return await repo.create(data);
}
```

#### 에러 처리
```typescript
// ✅ 좋은 예 - 구체적인 에러 타입
class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Validation failed: ${errors.join(', ')}`);
  }
}

// ✅ 좋은 예 - 에러 처리
try {
  const result = await analyzePRD(prd);
  return { success: true, data: result };
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, error: 'Invalid input' };
  }
  throw error;
}
```

### 1.2 React/Next.js 규칙

#### 컴포넌트 구조
```typescript
// ✅ 좋은 예 - 명확한 구조
interface AnalyzeFormProps {
  onSubmit: (prd: string) => Promise<void>;
  loading?: boolean;
}

export function AnalyzeForm({ onSubmit, loading = false }: AnalyzeFormProps) {
  const [prd, setPrd] = useState('');
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prd.trim()) return;
    await onSubmit(prd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={prd}
        onChange={(e) => setPrd(e.target.value)}
        placeholder="PRD를 입력하세요..."
        className="w-full p-3 border rounded"
      />
      <button 
        type="submit" 
        disabled={loading || !prd.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? '분석 중...' : '분석 실행'}
      </button>
    </form>
  );
}
```

#### 훅 사용 규칙
```typescript
// ✅ 좋은 예 - 커스텀 훅으로 로직 분리
function usePRDAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const analyze = async (prd: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { analyze, loading, result };
}
```

### 1.3 데이터베이스 규칙

#### 쿼리 최적화
```sql
-- ✅ 좋은 예 - 인덱스 활용
SELECT p.*, a.domain, s.positioning
FROM projects p
LEFT JOIN analysis a ON p.id = a.project_id
LEFT JOIN strategy s ON p.id = s.project_id
WHERE p.owner_id = $1
ORDER BY p.created_at DESC
LIMIT 20;

-- ❌ 나쁜 예 - N+1 쿼리
SELECT * FROM projects WHERE owner_id = $1;
-- 각 프로젝트마다 별도 쿼리 실행
```

#### RLS 정책
```sql
-- ✅ 좋은 예 - 명확한 RLS 정책
CREATE POLICY "owner_select_projects" ON public.projects
  FOR SELECT USING (auth.uid() = owner_id);

-- ❌ 나쁜 예 - 너무 광범위한 권한
CREATE POLICY "all_access" ON public.projects
  FOR ALL USING (true);
```

## 2. 아키텍처 원칙

### 2.1 클린 아키텍처 준수

#### 레이어 분리
```
📁 packages/
├── domain/          # 비즈니스 로직 (순수)
├── use-cases/       # 애플리케이션 로직
├── ports/           # 인터페이스 정의
├── adapters/        # 외부 시스템 연동
└── shared/          # 공통 유틸리티
```

#### 의존성 방향
```typescript
// ✅ 올바른 의존성 방향
// domain ← use-cases ← ports ← adapters

// Domain (의존성 없음)
export type Project = { id: string; name: string; };

// Use Cases (Domain에만 의존)
export class SubmitPrdUseCase {
  constructor(private repo: ProjectRepo) {}
}

// Ports (Domain에만 의존)
export interface ProjectRepo {
  create(project: Project): Promise<string>;
}

// Adapters (Ports에 의존)
export class SupabaseProjectRepo implements ProjectRepo {
  // Supabase 구현
}
```

### 2.2 SOLID 원칙 적용

#### 단일 책임 원칙 (SRP)
```typescript
// ✅ 좋은 예 - 각 클래스가 하나의 책임
class PRDAnalyzer {
  async analyze(prd: string): Promise<Analysis> {
    // PRD 분석만 담당
  }
}

class StrategyGenerator {
  async generate(analysis: Analysis): Promise<Strategy> {
    // 전략 생성만 담당
  }
}

// ❌ 나쁜 예 - 여러 책임을 가진 클래스
class PRDProcessor {
  async analyze(prd: string): Promise<Analysis> { }
  async generateStrategy(analysis: Analysis): Promise<Strategy> { }
  async sendEmail(user: User): Promise<void> { }
  async saveToDatabase(data: any): Promise<void> { }
}
```

#### 개방-폐쇄 원칙 (OCP)
```typescript
// ✅ 좋은 예 - 확장에 열려있고 수정에 닫혀있음
interface LlmProvider {
  analyze(text: string): Promise<Analysis>;
}

class OpenAIProvider implements LlmProvider {
  async analyze(text: string): Promise<Analysis> {
    // OpenAI 구현
  }
}

class AnthropicProvider implements LlmProvider {
  async analyze(text: string): Promise<Analysis> {
    // Anthropic 구현
  }
}
```

## 3. Git 워크플로우

### 3.1 브랜치 전략

```
main
├── develop
├── feature/PRD-123-add-content-generation
├── feature/PRD-124-improve-analysis-accuracy
├── hotfix/PRD-125-fix-auth-bug
└── release/v1.2.0
```

#### 브랜치 명명 규칙
- `feature/PRD-{번호}-{기능명}`: 새 기능
- `bugfix/PRD-{번호}-{버그명}`: 버그 수정
- `hotfix/PRD-{번호}-{긴급수정명}`: 긴급 수정
- `release/v{버전}`: 릴리스 브랜치

### 3.2 커밋 메시지 규칙

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 타입 종류
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

#### 예시
```
feat(analysis): add domain classification to PRD analysis

- Implement automatic domain detection
- Add support for SaaS, E-commerce, Fintech domains
- Update analysis result schema

Closes PRD-123
```

### 3.3 PR 템플릿

```markdown
## 📋 변경 사항
- [ ] 새 기능 추가
- [ ] 버그 수정
- [ ] 성능 개선
- [ ] 문서 업데이트

## 🔍 상세 설명
변경 사항에 대한 자세한 설명

## 🧪 테스트
- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 수동 테스트 완료

## 📸 스크린샷 (UI 변경시)
Before/After 스크린샷 첨부

## 🔗 관련 이슈
Closes #123
```

## 4. 코드 리뷰 가이드

### 4.1 리뷰 체크리스트

#### 기능성
- [ ] 요구사항을 정확히 구현했는가?
- [ ] 에러 처리가 적절한가?
- [ ] 엣지 케이스를 고려했는가?

#### 코드 품질
- [ ] 코드가 읽기 쉽고 이해하기 쉬운가?
- [ ] 중복 코드가 없는가?
- [ ] 적절한 추상화 수준인가?

#### 성능
- [ ] 불필요한 API 호출이 없는가?
- [ ] 데이터베이스 쿼리가 최적화되었는가?
- [ ] 메모리 누수가 없는가?

#### 보안
- [ ] 입력 검증이 적절한가?
- [ ] SQL 인젝션 방지가 되어있는가?
- [ ] 인증/인가가 올바른가?

### 4.2 리뷰 댓글 가이드

```typescript
// ✅ 좋은 리뷰 댓글
// "이 함수가 너무 길어서 가독성이 떨어집니다. 
//  validateInput, processData, saveResult로 분리하는 것이 어떨까요?"

// ✅ 구체적인 제안
// "이 부분에서 N+1 쿼리 문제가 발생할 수 있습니다. 
//  JOIN을 사용하거나 include 옵션을 활용해보세요."

// ❌ 나쁜 리뷰 댓글
// "이 코드가 이상해요"
// "왜 이렇게 했어요?"
```

## 5. 테스트 전략

### 5.1 테스트 피라미드

```
    /\
   /  \     E2E Tests (10%)
  /____\    
 /      \   Integration Tests (20%)
/________\  
            Unit Tests (70%)
```

### 5.2 단위 테스트 예시

```typescript
// ✅ 좋은 단위 테스트
describe('PRDAnalyzer', () => {
  let analyzer: PRDAnalyzer;
  let mockLlmProvider: jest.Mocked<LlmProvider>;

  beforeEach(() => {
    mockLlmProvider = {
      analyze: jest.fn(),
    };
    analyzer = new PRDAnalyzer(mockLlmProvider);
  });

  it('should analyze PRD and return structured result', async () => {
    // Given
    const prd = 'SaaS product for creators';
    const expectedResult = {
      domain: 'Creator SaaS',
      personas: [],
      pains: [],
    };
    mockLlmProvider.analyze.mockResolvedValue(expectedResult);

    // When
    const result = await analyzer.analyze(prd);

    // Then
    expect(result).toEqual(expectedResult);
    expect(mockLlmProvider.analyze).toHaveBeenCalledWith(prd);
  });

  it('should throw error when LLM provider fails', async () => {
    // Given
    mockLlmProvider.analyze.mockRejectedValue(new Error('LLM Error'));

    // When & Then
    await expect(analyzer.analyze('test')).rejects.toThrow('LLM Error');
  });
});
```

### 5.3 통합 테스트 예시

```typescript
// ✅ 좋은 통합 테스트
describe('PRD Analysis API', () => {
  it('should analyze PRD and return result', async () => {
    // Given
    const prd = 'Test PRD content';
    
    // When
    const response = await request(app)
      .post('/api/analyze')
      .send({ prd })
      .expect(200);

    // Then
    expect(response.body).toHaveProperty('domain');
    expect(response.body).toHaveProperty('personas');
    expect(response.body).toHaveProperty('pains');
  });
});
```

## 6. 성능 가이드라인

### 6.1 프론트엔드 성능

#### 코드 스플리팅
```typescript
// ✅ 좋은 예 - 동적 임포트
const AnalyzeForm = lazy(() => import('./AnalyzeForm'));
const ResultsView = lazy(() => import('./ResultsView'));

// ✅ 좋은 예 - 조건부 로딩
const AdvancedFeatures = lazy(() => 
  import('./AdvancedFeatures').then(module => ({
    default: module.AdvancedFeatures
  }))
);
```

#### 메모이제이션
```typescript
// ✅ 좋은 예 - React.memo 사용
const AnalysisResult = React.memo(({ result }: { result: Analysis }) => {
  return (
    <div className="analysis-result">
      <h3>{result.domain}</h3>
      <PersonaList personas={result.personas} />
    </div>
  );
});

// ✅ 좋은 예 - useMemo 사용
const expensiveCalculation = useMemo(() => {
  return processAnalysisData(analysis);
}, [analysis]);
```

### 6.2 백엔드 성능

#### 데이터베이스 최적화
```sql
-- ✅ 좋은 예 - 인덱스 활용
CREATE INDEX idx_projects_owner_created 
ON projects(owner_id, created_at DESC);

-- ✅ 좋은 예 - 쿼리 최적화
SELECT p.*, a.domain, s.positioning
FROM projects p
LEFT JOIN analysis a ON p.id = a.project_id
LEFT JOIN strategy s ON p.id = s.project_id
WHERE p.owner_id = $1
ORDER BY p.created_at DESC
LIMIT 20;
```

#### 캐싱 전략
```typescript
// ✅ 좋은 예 - Redis 캐싱
class AnalysisService {
  async analyzePRD(prd: string): Promise<Analysis> {
    const cacheKey = `analysis:${hash(prd)}`;
    
    // 캐시 확인
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 분석 실행
    const result = await this.llmProvider.analyze(prd);
    
    // 캐시 저장 (1시간)
    await redis.setex(cacheKey, 3600, JSON.stringify(result));
    
    return result;
  }
}
```

## 7. 보안 체크리스트

### 7.1 입력 검증

```typescript
// ✅ 좋은 예 - 입력 검증
class PRDValidator {
  static validate(prd: string): ValidationResult {
    if (!prd || typeof prd !== 'string') {
      return { isValid: false, errors: ['PRD is required'] };
    }
    
    if (prd.length < 50) {
      return { isValid: false, errors: ['PRD must be at least 50 characters'] };
    }
    
    if (prd.length > 10000) {
      return { isValid: false, errors: ['PRD must be less than 10000 characters'] };
    }
    
    return { isValid: true, errors: [] };
  }
}
```

### 7.2 SQL 인젝션 방지

```typescript
// ✅ 좋은 예 - 파라미터화된 쿼리
async findProjectById(id: string): Promise<Project | null> {
  const { data, error } = await this.supabase
    .from('projects')
    .select('*')
    .eq('id', id)  // 자동으로 파라미터화됨
    .single();
    
  return data || null;
}

// ❌ 나쁜 예 - 문자열 연결
async findProjectById(id: string): Promise<Project | null> {
  const query = `SELECT * FROM projects WHERE id = '${id}'`;  // 위험!
  // ...
}
```

### 7.3 인증/인가

```typescript
// ✅ 좋은 예 - RLS 활용
export class ProjectService {
  async getProjects(userId: string): Promise<Project[]> {
    // RLS가 자동으로 owner_id = userId 필터링
    const { data } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    return data || [];
  }
}
```

## 8. 문서화 규칙

### 8.1 코드 문서화

```typescript
/**
 * PRD를 분석하여 도메인, 페르소나, 페인포인트를 추출합니다.
 * 
 * @param prd - 분석할 PRD 텍스트
 * @returns 분석 결과 (도메인, 페르소나, 페인포인트)
 * @throws {ValidationError} PRD가 유효하지 않은 경우
 * @throws {AnalysisError} 분석 과정에서 오류가 발생한 경우
 * 
 * @example
 * ```typescript
 * const analyzer = new PRDAnalyzer(llmProvider);
 * const result = await analyzer.analyze('SaaS product for creators...');
 * console.log(result.domain); // 'Creator SaaS'
 * ```
 */
export class PRDAnalyzer {
  constructor(private llmProvider: LlmProvider) {}
  
  async analyze(prd: string): Promise<Analysis> {
    // 구현...
  }
}
```

### 8.2 API 문서화

```typescript
/**
 * @swagger
 * /api/analyze:
 *   post:
 *     summary: PRD 분석
 *     description: PRD 텍스트를 분석하여 도메인, 페르소나, 페인포인트를 추출합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prd:
 *                 type: string
 *                 description: 분석할 PRD 텍스트
 *                 example: "SaaS product for creators..."
 *     responses:
 *       200:
 *         description: 분석 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalysisResult'
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
```

---

**문서 버전**: v1.0  
**최종 업데이트**: 2024-01-15  
**작성자**: Ignite Development Team
