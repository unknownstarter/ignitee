// Port 인터페이스 정의 (Hexagonal Architecture)

import { 
  Project, 
  Analysis, 
  Strategy, 
  ContentPlan, 
  ContentItem, 
  Engagement,
  Persona,
  SolutionMapping,
  Competitor
} from '@ignitee/domain';

// ===== LLM PORTS =====

export interface LLMPort {
  analyzePRD(input: { prd: string }): Promise<{
    domain: string;
    personas: Persona[];
    pains: string[];
    solutionMap: SolutionMapping[];
    competitors: Competitor[];
  }>;

  craftStrategy(input: { analysis: Analysis }): Promise<{
    positioning: any;
    keyMessages: any[];
    channelMix: any[];
    funnelHypothesis: any;
  }>;

  draftContent(input: { 
    strategy: Strategy; 
    channel: string;
    count?: number;
  }): Promise<ContentDraftDTO[]>;

  generateHooks(input: { 
    channel: string;
    content: string;
    count?: number;
  }): Promise<string[]>;

  generateHashtags(input: { 
    channel: string;
    content: string;
    count?: number;
  }): Promise<string[]>;

  optimizeContent(input: { 
    content: string;
    channel: string;
    targetAudience: string;
  }): Promise<string>;
}

// ===== CHANNEL PORTS =====

export interface ChannelPort {
  publish(item: ContentDraftDTO): Promise<{ postId: string; url: string }>;
  
  fetchMetrics(ref: { postId: string }): Promise<EngagementDTO>;
  
  schedulePost(input: { 
    content: string;
    scheduledAt: Date;
    channel: string;
  }): Promise<{ postId: string }>;
  
  deletePost(postId: string): Promise<void>;
  
  updatePost(postId: string, content: string): Promise<void>;
  
  getPostAnalytics(postId: string): Promise<PostAnalyticsDTO>;
}

// ===== REPOSITORY PORTS =====

export interface ProjectRepo {
  create(project: Project): Promise<string>;
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  update(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface AnalysisRepo {
  create(analysis: Analysis): Promise<string>;
  findByProjectId(projectId: string): Promise<Analysis | null>;
  update(analysis: Analysis): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface StrategyRepo {
  create(strategy: Strategy): Promise<string>;
  findByProjectId(projectId: string): Promise<Strategy | null>;
  update(strategy: Strategy): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ContentPlanRepo {
  create(contentPlan: ContentPlan): Promise<string>;
  findByProjectId(projectId: string): Promise<ContentPlan | null>;
  update(contentPlan: ContentPlan): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ContentItemRepo {
  create(contentItem: ContentItem): Promise<string>;
  findByPlanId(planId: string): Promise<ContentItem[]>;
  findByProjectId(projectId: string): Promise<ContentItem[]>;
  update(contentItem: ContentItem): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface EngagementRepo {
  create(engagement: Engagement): Promise<string>;
  findByContentItemId(contentItemId: string): Promise<Engagement[]>;
  findByProjectId(projectId: string): Promise<Engagement[]>;
  update(engagement: Engagement): Promise<void>;
  delete(id: string): Promise<void>;
}

// ===== NOTIFICATION PORTS =====

export interface NotificationPort {
  sendEmail(input: {
    to: string;
    subject: string;
    body: string;
    template?: string;
  }): Promise<void>;

  sendSlack(input: {
    channel: string;
    message: string;
    attachments?: any[];
  }): Promise<void>;

  sendDiscord(input: {
    webhookUrl: string;
    message: string;
    embeds?: any[];
  }): Promise<void>;
}

// ===== CACHE PORTS =====

export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

// ===== QUEUE PORTS =====

export interface QueuePort {
  addJob(jobName: string, data: any, options?: any): Promise<void>;
  processJob(jobName: string, processor: (data: any) => Promise<void>): void;
  getJobStatus(jobId: string): Promise<JobStatus>;
  cancelJob(jobId: string): Promise<void>;
}

// ===== FILE STORAGE PORTS =====

export interface FileStoragePort {
  upload(file: Buffer, path: string): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getUrl(path: string): Promise<string>;
  listFiles(prefix: string): Promise<string[]>;
}

// ===== ANALYTICS PORTS =====

export interface AnalyticsPort {
  trackEvent(event: {
    name: string;
    properties: Record<string, any>;
    userId?: string;
  }): Promise<void>;

  trackPageView(page: {
    url: string;
    title: string;
    userId?: string;
  }): Promise<void>;

  getMetrics(query: {
    startDate: Date;
    endDate: Date;
    metrics: string[];
  }): Promise<MetricsDTO>;
}

// ===== EXTERNAL API PORTS =====

export interface ExternalAPIPort {
  get<T>(url: string, headers?: Record<string, string>): Promise<T>;
  post<T>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
  put<T>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
  delete<T>(url: string, headers?: Record<string, string>): Promise<T>;
}

// ===== DTOs =====

export interface ContentDraftDTO {
  channel: string;
  title: string;
  content: string;
  mediaPrompt?: string;
  hashtags: string[];
  scheduledAt?: Date;
}

export interface EngagementDTO {
  impressions: number;
  clicks: number;
  ctr: number;
  likes: number;
  shares: number;
  comments: number;
  conversions: number;
  capturedAt: Date;
}

export interface PostAnalyticsDTO {
  postId: string;
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  shares: number;
  comments: number;
  saves: number;
  profileVisits: number;
  websiteClicks: number;
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
  };
  topPosts: Array<{
    postId: string;
    performance: number;
  }>;
}

export interface MetricsDTO {
  totalUsers: number;
  activeUsers: number;
  conversionRate: number;
  revenue: number;
  topChannels: Array<{
    channel: string;
    performance: number;
  }>;
  trends: Array<{
    date: string;
    value: number;
  }>;
}

export interface JobStatus {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
}

// ===== CHANNEL ADAPTERS =====

export interface YouTubeAdapter extends ChannelPort {
  uploadVideo(input: {
    title: string;
    description: string;
    videoFile: Buffer;
    thumbnail?: Buffer;
    tags: string[];
    privacy: 'public' | 'private' | 'unlisted';
  }): Promise<{ videoId: string; url: string }>;

  createShort(input: {
    title: string;
    videoFile: Buffer;
    description?: string;
  }): Promise<{ videoId: string; url: string }>;
}

export interface InstagramAdapter extends ChannelPort {
  postPhoto(input: {
    image: Buffer;
    caption: string;
    hashtags: string[];
    location?: string;
  }): Promise<{ postId: string; url: string }>;

  postStory(input: {
    image: Buffer;
    text?: string;
    stickers?: any[];
  }): Promise<{ storyId: string }>;

  postReel(input: {
    video: Buffer;
    caption: string;
    hashtags: string[];
  }): Promise<{ reelId: string; url: string }>;
}

export interface TikTokAdapter extends ChannelPort {
  uploadVideo(input: {
    video: Buffer;
    description: string;
    hashtags: string[];
    privacy: 'public' | 'private';
  }): Promise<{ videoId: string; url: string }>;
}

export interface TwitterAdapter extends ChannelPort {
  postTweet(input: {
    text: string;
    media?: Buffer[];
    replyTo?: string;
  }): Promise<{ tweetId: string; url: string }>;

  postThread(input: {
    tweets: string[];
    media?: Buffer[];
  }): Promise<{ tweetIds: string[]; url: string }>;
}

export interface LinkedInAdapter extends ChannelPort {
  postUpdate(input: {
    text: string;
    media?: Buffer;
    visibility: 'public' | 'connections';
  }): Promise<{ postId: string; url: string }>;

  postArticle(input: {
    title: string;
    content: string;
    tags: string[];
  }): Promise<{ articleId: string; url: string }>;
}