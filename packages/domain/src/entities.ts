// 도메인 엔티티 정의 (Clean Architecture + CQRS)

// ===== CORE DOMAIN ENTITIES =====

export class Project {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly name: string,
    public readonly prd: string,
    public readonly industry?: string,
    public readonly targets?: string[],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt?: Date
  ) {}

  static create(ownerId: string, name: string, prd: string, industry?: string, targets?: string[]): Project {
    const id = crypto.randomUUID();
    return new Project(id, ownerId, name, prd, industry, targets);
  }

  updatePrd(newPrd: string): Project {
    return new Project(
      this.id,
      this.ownerId,
      this.name,
      newPrd,
      this.industry,
      this.targets,
      this.createdAt,
      new Date()
    );
  }
}

export class Analysis {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly domain: string,
    public readonly personas: Persona[],
    public readonly pains: string[],
    public readonly solutionMap: SolutionMapping[],
    public readonly competitors: Competitor[],
    public readonly createdAt: Date = new Date()
  ) {}

  static fromLLM(projectId: string, llmResult: any): Analysis {
    const id = crypto.randomUUID();
    return new Analysis(
      id,
      projectId,
      llmResult.domain,
      llmResult.personas,
      llmResult.pains,
      llmResult.solutionMap,
      llmResult.competitors
    );
  }
}

export class Persona {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly pain: string,
    public readonly need: string,
    public readonly behavior: string[],
    public readonly demographics: Demographics
  ) {}
}

export class Demographics {
  constructor(
    public readonly age: string,
    public readonly gender: string,
    public readonly income: string,
    public readonly location: string
  ) {}
}

export class SolutionMapping {
  constructor(
    public readonly pain: string,
    public readonly solution: string,
    public readonly priority: 'high' | 'medium' | 'low',
    public readonly effort: 'low' | 'medium' | 'high',
    public readonly impact: 'low' | 'medium' | 'high'
  ) {}
}

export class Competitor {
  constructor(
    public readonly name: string,
    public readonly strengths: string[],
    public readonly weaknesses: string[],
    public readonly marketShare: number,
    public readonly pricing: string
  ) {}
}

export class Strategy {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly positioning: Positioning,
    public readonly keyMessages: KeyMessage[],
    public readonly channelMix: ChannelStrategy[],
    public readonly funnelHypothesis: FunnelHypothesis,
    public readonly createdAt: Date = new Date()
  ) {}

  static fromAnalysis(projectId: string, analysis: Analysis, strategyData: any): Strategy {
    const id = crypto.randomUUID();
    return new Strategy(
      id,
      projectId,
      strategyData.positioning,
      strategyData.keyMessages,
      strategyData.channelMix,
      strategyData.funnelHypothesis
    );
  }
}

export class Positioning {
  constructor(
    public readonly target: string,
    public readonly benefit: string,
    public readonly differentiation: string,
    public readonly proof: string[],
    public readonly valueProposition: string
  ) {}
}

export class KeyMessage {
  constructor(
    public readonly message: string,
    public readonly tone: 'professional' | 'casual' | 'friendly' | 'authoritative',
    public readonly useCase: string,
    public readonly channel: string,
    public readonly priority: number
  ) {}
}

export class ChannelStrategy {
  constructor(
    public readonly channel: string,
    public readonly strategy: string,
    public readonly contentTypes: string[],
    public readonly frequency: string,
    public readonly goals: string[],
    public readonly budget: number,
    public readonly expectedROI: number
  ) {}
}

export class FunnelHypothesis {
  constructor(
    public readonly awareness: string,
    public readonly interest: string,
    public readonly consideration: string,
    public readonly conversion: string,
    public readonly retention: string
  ) {}
}

export class ContentPlan {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly calendar: CalendarItem[],
    public readonly channelGuides: ChannelGuide[],
    public readonly hooks: Hook[],
    public readonly hashtags: Hashtag[],
    public readonly createdAt: Date = new Date()
  ) {}
}

export class CalendarItem {
  constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly channel: string,
    public readonly title: string,
    public readonly type: ContentType,
    public readonly status: ContentStatus,
    public readonly priority: number
  ) {}
}

export class ChannelGuide {
  constructor(
    public readonly channel: string,
    public readonly hooks: string[],
    public readonly hashtags: string[],
    public readonly cta: string,
    public readonly bestPractices: string[]
  ) {}
}

export class Hook {
  constructor(
    public readonly text: string,
    public readonly channel: string,
    public readonly effectiveness: number
  ) {}
}

export class Hashtag {
  constructor(
    public readonly tag: string,
    public readonly channel: string,
    public readonly popularity: number
  ) {}
}

export class ContentItem {
  constructor(
    public readonly id: string,
    public readonly planId: string,
    public readonly channel: string,
    public readonly copy: string,
    public readonly mediaPrompt: string,
    public readonly status: ContentStatus,
    public readonly externalPostId?: string,
    public readonly scheduledAt?: Date,
    public readonly publishedAt?: Date,
    public readonly createdAt: Date = new Date()
  ) {}
}

export class Engagement {
  constructor(
    public readonly id: string,
    public readonly contentItemId: string,
    public readonly impressions: number,
    public readonly clicks: number,
    public readonly ctr: number,
    public readonly likes: number,
    public readonly shares: number,
    public readonly comments: number,
    public readonly conversions: number,
    public readonly capturedAt: Date = new Date()
  ) {}
}

// ===== VALUE OBJECTS =====

export class ContentType {
  static readonly EDUCATIONAL = 'educational';
  static readonly ENTERTAINMENT = 'entertainment';
  static readonly BEHIND_SCENES = 'behind-scenes';
  static readonly PROMOTIONAL = 'promotional';
  static readonly USER_GENERATED = 'user-generated';
}

export class ContentStatus {
  static readonly DRAFT = 'draft';
  static readonly SCHEDULED = 'scheduled';
  static readonly PUBLISHED = 'published';
  static readonly ARCHIVED = 'archived';
  static readonly FAILED = 'failed';
}

// ===== DOMAIN EVENTS =====

export abstract class DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class PRDSubmittedEvent extends DomainEvent {
  constructor(projectId: string, public readonly prd: string) {
    super(projectId);
  }
}

export class AnalysisCompletedEvent extends DomainEvent {
  constructor(projectId: string, public readonly analysis: Analysis) {
    super(projectId);
  }
}

export class StrategyGeneratedEvent extends DomainEvent {
  constructor(projectId: string, public readonly strategy: Strategy) {
    super(projectId);
  }
}

export class ContentPlanCreatedEvent extends DomainEvent {
  constructor(projectId: string, public readonly contentPlan: ContentPlan) {
    super(projectId);
  }
}

export class ContentPostedEvent extends DomainEvent {
  constructor(projectId: string, public readonly contentItems: ContentItem[]) {
    super(projectId);
  }
}

export class MetricsIngestedEvent extends DomainEvent {
  constructor(projectId: string, public readonly engagement: Engagement[]) {
    super(projectId);
  }
}

// ===== DOMAIN SERVICES =====

export class ContentOptimizationService {
  optimizeForChannel(content: string, channel: string): string {
    // 채널별 콘텐츠 최적화 로직
    switch (channel) {
      case 'youtube':
        return this.optimizeForYouTube(content);
      case 'instagram':
        return this.optimizeForInstagram(content);
      case 'tiktok':
        return this.optimizeForTikTok(content);
      default:
        return content;
    }
  }

  private optimizeForYouTube(content: string): string {
    // YouTube 최적화 로직
    return content;
  }

  private optimizeForInstagram(content: string): string {
    // Instagram 최적화 로직
    return content;
  }

  private optimizeForTikTok(content: string): string {
    // TikTok 최적화 로직
    return content;
  }
}

export class MetricsAnalysisService {
  calculateROI(engagement: Engagement, cost: number): number {
    const revenue = engagement.conversions * 100; // 가정: 전환당 100원
    return (revenue - cost) / cost;
  }

  identifyTrends(engagements: Engagement[]): string[] {
    // 트렌드 분석 로직
    return ['교육 콘텐츠 성과 우수', '저녁 시간대 참여도 높음'];
  }
}