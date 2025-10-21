// 이벤트 드리븐 아키텍처 구현

import { DomainEvent } from '@ignitee/domain';

// ===== EVENT BUS =====

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}

export interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}

// ===== EVENT STORE =====

export interface EventStore {
  save(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsByType(eventType: string): Promise<DomainEvent[]>;
  getEventsSince(timestamp: Date): Promise<DomainEvent[]>;
}

// ===== EVENT HANDLERS =====

export class PRDSubmittedEventHandler implements EventHandler {
  constructor(
    private llmPort: any, // LLMPort
    private analysisRepo: any, // AnalysisRepo
    private eventBus: EventBus
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    console.log('📊 PRD Submitted Event Handler: 분석 시작...');
    
    // PRD 분석 실행
    const analysis = await this.llmPort.analyzePRD({ prd: event.prd });
    
    // 분석 결과 저장
    const analysisEntity = Analysis.fromLLM(event.aggregateId, analysis);
    await this.analysisRepo.create(analysisEntity);
    
    // 다음 이벤트 발행
    await this.eventBus.publish(new AnalysisCompletedEvent(event.aggregateId, analysisEntity));
  }
}

export class AnalysisCompletedEventHandler implements EventHandler {
  constructor(
    private llmPort: any, // LLMPort
    private strategyRepo: any, // StrategyRepo
    private eventBus: EventBus
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    console.log('🎯 Analysis Completed Event Handler: 전략 생성 시작...');
    
    // 전략 생성 실행
    const strategy = await this.llmPort.craftStrategy({ analysis: event.analysis });
    
    // 전략 저장
    const strategyEntity = Strategy.fromAnalysis(event.aggregateId, event.analysis, strategy);
    await this.strategyRepo.create(strategyEntity);
    
    // 다음 이벤트 발행
    await this.eventBus.publish(new StrategyGeneratedEvent(event.aggregateId, strategyEntity));
  }
}

export class StrategyGeneratedEventHandler implements EventHandler {
  constructor(
    private llmPort: any, // LLMPort
    private contentPlanRepo: any, // ContentPlanRepo
    private eventBus: EventBus
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    console.log('📝 Strategy Generated Event Handler: 콘텐츠 계획 생성 시작...');
    
    // 콘텐츠 계획 생성 실행
    const contentPlan = await this.llmPort.generateContentPlan({ strategy: event.strategy });
    
    // 콘텐츠 계획 저장
    await this.contentPlanRepo.create(contentPlan);
    
    // 다음 이벤트 발행
    await this.eventBus.publish(new ContentPlanCreatedEvent(event.aggregateId, contentPlan));
  }
}

export class ContentPlanCreatedEventHandler implements EventHandler {
  constructor(
    private channelPort: any, // ChannelPort
    private contentItemRepo: any, // ContentItemRepo
    private eventBus: EventBus
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    console.log('📤 Content Plan Created Event Handler: 콘텐츠 발행 시작...');
    
    const contentItems: ContentItem[] = [];
    
    // 각 콘텐츠 아이템 발행
    for (const item of event.contentPlan.calendar) {
      const result = await this.channelPort.publish({
        channel: item.channel,
        title: item.title,
        content: item.content,
        scheduledAt: item.date
      });
      
      const contentItem = new ContentItem(
        crypto.randomUUID(),
        event.contentPlan.id,
        item.channel,
        item.content,
        item.mediaPrompt,
        'published',
        result.postId,
        item.date,
        new Date()
      );
      
      contentItems.push(contentItem);
      await this.contentItemRepo.create(contentItem);
    }
    
    // 다음 이벤트 발행
    await this.eventBus.publish(new ContentPostedEvent(event.aggregateId, contentItems));
  }
}

export class ContentPostedEventHandler implements EventHandler {
  constructor(
    private channelPort: any, // ChannelPort
    private engagementRepo: any, // EngagementRepo
    private eventBus: EventBus
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    console.log('📊 Content Posted Event Handler: 지표 수집 시작...');
    
    const engagements: Engagement[] = [];
    
    // 각 콘텐츠 아이템의 지표 수집
    for (const contentItem of event.contentItems) {
      const metrics = await this.channelPort.fetchMetrics({ postId: contentItem.externalPostId });
      
      const engagement = new Engagement(
        crypto.randomUUID(),
        contentItem.id,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.likes,
        metrics.shares,
        metrics.comments,
        metrics.conversions
      );
      
      engagements.push(engagement);
      await this.engagementRepo.create(engagement);
    }
    
    // 다음 이벤트 발행
    await this.eventBus.publish(new MetricsIngestedEvent(event.aggregateId, engagements));
  }
}

export class MetricsIngestedEventHandler implements EventHandler {
  constructor(
    private analyticsService: any, // AnalyticsService
    private notificationPort: any // NotificationPort
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    console.log('🔄 Metrics Ingested Event Handler: 피드백 분석 시작...');
    
    // 피드백 분석
    const insights = await this.analyticsService.analyzeMetrics(event.engagement);
    const recommendations = await this.analyticsService.generateRecommendations(insights);
    
    // 사용자에게 알림
    await this.notificationPort.sendEmail({
      to: 'user@example.com',
      subject: '콘텐츠 성과 분석 완료',
      body: `인사이트: ${insights.join(', ')}\n추천사항: ${recommendations.join(', ')}`
    });
    
    console.log('✅ 피드백 분석 완료!');
  }
}

// ===== EVENT BUS IMPLEMENTATION =====

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];
    
    console.log(`📢 Publishing event: ${eventType} for aggregate: ${event.aggregateId}`);
    
    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`❌ Error handling event ${eventType}:`, error);
        // 에러가 발생해도 다른 핸들러는 계속 실행
      }
    }
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

// ===== EVENT STORE IMPLEMENTATION =====

export class SupabaseEventStore implements EventStore {
  constructor(private supabase: any) {}

  async save(event: DomainEvent): Promise<void> {
    await this.supabase
      .from('domain_events')
      .insert({
        aggregate_id: event.aggregateId,
        event_type: event.constructor.name,
        event_data: event,
        occurred_on: event.occurredOn
      });
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const { data } = await this.supabase
      .from('domain_events')
      .select('*')
      .eq('aggregate_id', aggregateId)
      .order('occurred_on', { ascending: true });
    
    return data || [];
  }

  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    const { data } = await this.supabase
      .from('domain_events')
      .select('*')
      .eq('event_type', eventType)
      .order('occurred_on', { ascending: true });
    
    return data || [];
  }

  async getEventsSince(timestamp: Date): Promise<DomainEvent[]> {
    const { data } = await this.supabase
      .from('domain_events')
      .select('*')
      .gte('occurred_on', timestamp.toISOString())
      .order('occurred_on', { ascending: true });
    
    return data || [];
  }
}

// ===== EVENT WORKFLOW =====

export class IgniteeEventWorkflow {
  private eventBus: EventBus;
  private eventStore: EventStore;

  constructor(eventBus: EventBus, eventStore: EventStore) {
    this.eventBus = eventBus;
    this.eventStore = eventStore;
  }

  async startWorkflow(projectId: string, prd: string): Promise<void> {
    console.log('🚀 Ignitee Event Workflow 시작...');
    
    // 첫 이벤트 발행
    const prdSubmittedEvent = new PRDSubmittedEvent(projectId, prd);
    
    // 이벤트 저장
    await this.eventStore.save(prdSubmittedEvent);
    
    // 이벤트 발행
    await this.eventBus.publish(prdSubmittedEvent);
    
    console.log('✅ Ignitee Event Workflow 시작됨!');
  }

  async replayEvents(projectId: string): Promise<void> {
    console.log('🔄 이벤트 재생 시작...');
    
    const events = await this.eventStore.getEvents(projectId);
    
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    
    console.log('✅ 이벤트 재생 완료!');
  }
}

// ===== EVENT HANDLER REGISTRATION =====

export function registerEventHandlers(
  eventBus: EventBus,
  dependencies: {
    llmPort: any;
    analysisRepo: any;
    strategyRepo: any;
    contentPlanRepo: any;
    contentItemRepo: any;
    engagementRepo: any;
    channelPort: any;
    analyticsService: any;
    notificationPort: any;
  }
): void {
  // 이벤트 핸들러 등록
  eventBus.subscribe('PRDSubmittedEvent', new PRDSubmittedEventHandler(
    dependencies.llmPort,
    dependencies.analysisRepo,
    eventBus
  ));

  eventBus.subscribe('AnalysisCompletedEvent', new AnalysisCompletedEventHandler(
    dependencies.llmPort,
    dependencies.strategyRepo,
    eventBus
  ));

  eventBus.subscribe('StrategyGeneratedEvent', new StrategyGeneratedEventHandler(
    dependencies.llmPort,
    dependencies.contentPlanRepo,
    eventBus
  ));

  eventBus.subscribe('ContentPlanCreatedEvent', new ContentPlanCreatedEventHandler(
    dependencies.channelPort,
    dependencies.contentItemRepo,
    eventBus
  ));

  eventBus.subscribe('ContentPostedEvent', new ContentPostedEventHandler(
    dependencies.channelPort,
    dependencies.engagementRepo,
    eventBus
  ));

  eventBus.subscribe('MetricsIngestedEvent', new MetricsIngestedEventHandler(
    dependencies.analyticsService,
    dependencies.notificationPort
  ));

  console.log('📋 모든 이벤트 핸들러 등록 완료!');
}
