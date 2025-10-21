import { createClient } from '@supabase/supabase-js';
import type { 
  ProjectRepo, 
  AnalysisRepo, 
  StrategyRepo, 
  ContentRepo, 
  FeedbackRepo 
} from '@ports/ports';
import type { Project, Analysis, Strategy, Content, Feedback } from '@domain/domain';

export class SupabaseProjectRepo implements ProjectRepo {
  private supabase;

  constructor(url: string, serviceKey: string) {
    this.supabase = createClient(url, serviceKey);
  }

  async create(input: { ownerId: string; name: string; prd: string }): Promise<string> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        owner_id: input.ownerId,
        name: input.name,
        prd_text: input.prd,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async findById(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data ? this.mapToProject(data) : null;
  }

  async findByOwner(ownerId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(this.mapToProject);
  }

  async update(id: string, data: Partial<Project>): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .update({
        name: data.name,
        prd_text: data.prd,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapToProject(data: any): Project {
    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      prd: data.prd_text,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export class SupabaseAnalysisRepo implements AnalysisRepo {
  private supabase;

  constructor(url: string, serviceKey: string) {
    this.supabase = createClient(url, serviceKey);
  }

  async create(analysis: Omit<Analysis, 'id' | 'createdAt'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('analysis')
      .insert({
        project_id: analysis.projectId,
        domain: analysis.domain,
        personas: analysis.personas,
        pains: analysis.pains,
        solution_map: analysis.solutionMap,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async findByProject(projectId: string): Promise<Analysis | null> {
    const { data, error } = await this.supabase
      .from('analysis')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) return null;
    return data ? this.mapToAnalysis(data) : null;
  }

  async update(id: string, data: Partial<Analysis>): Promise<void> {
    const { error } = await this.supabase
      .from('analysis')
      .update({
        domain: data.domain,
        personas: data.personas,
        pains: data.pains,
        solution_map: data.solutionMap,
      })
      .eq('id', id);

    if (error) throw error;
  }

  private mapToAnalysis(data: any): Analysis {
    return {
      id: data.id,
      projectId: data.project_id,
      domain: data.domain,
      personas: data.personas,
      pains: data.pains,
      solutionMap: data.solution_map,
      createdAt: data.created_at,
    };
  }
}

export class SupabaseStrategyRepo implements StrategyRepo {
  private supabase;

  constructor(url: string, serviceKey: string) {
    this.supabase = createClient(url, serviceKey);
  }

  async create(strategy: Omit<Strategy, 'id' | 'createdAt'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('strategy')
      .insert({
        project_id: strategy.projectId,
        positioning: strategy.positioning,
        key_messages: strategy.keyMessages,
        channel_mix: strategy.channelMix,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async findByProject(projectId: string): Promise<Strategy | null> {
    const { data, error } = await this.supabase
      .from('strategy')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) return null;
    return data ? this.mapToStrategy(data) : null;
  }

  async update(id: string, data: Partial<Strategy>): Promise<void> {
    const { error } = await this.supabase
      .from('strategy')
      .update({
        positioning: data.positioning,
        key_messages: data.keyMessages,
        channel_mix: data.channelMix,
      })
      .eq('id', id);

    if (error) throw error;
  }

  private mapToStrategy(data: any): Strategy {
    return {
      id: data.id,
      projectId: data.project_id,
      positioning: data.positioning,
      keyMessages: data.key_messages,
      channelMix: data.channel_mix,
      createdAt: data.created_at,
    };
  }
}

export class SupabaseContentRepo implements ContentRepo {
  private supabase;

  constructor(url: string, serviceKey: string) {
    this.supabase = createClient(url, serviceKey);
  }

  async create(content: Omit<Content, 'id' | 'createdAt'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('content')
      .insert({
        project_id: content.projectId,
        platform: content.platform,
        title: content.title,
        description: content.description,
        type: content.type,
        status: content.status,
        scheduled_at: content.scheduledAt,
        published_at: content.publishedAt,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async findByProject(projectId: string): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('content')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(this.mapToContent);
  }

  async findByPlatform(projectId: string, platform: string): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('content')
      .select('*')
      .eq('project_id', projectId)
      .eq('platform', platform)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(this.mapToContent);
  }

  async update(id: string, data: Partial<Content>): Promise<void> {
    const { error } = await this.supabase
      .from('content')
      .update({
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        scheduled_at: data.scheduledAt,
        published_at: data.publishedAt,
      })
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapToContent(data: any): Content {
    return {
      id: data.id,
      projectId: data.project_id,
      platform: data.platform,
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      scheduledAt: data.scheduled_at,
      publishedAt: data.published_at,
      createdAt: data.created_at,
    };
  }
}

export class SupabaseFeedbackRepo implements FeedbackRepo {
  private supabase;

  constructor(url: string, serviceKey: string) {
    this.supabase = createClient(url, serviceKey);
  }

  async create(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('feedback')
      .insert({
        project_id: feedback.projectId,
        content_id: feedback.contentId,
        metrics: feedback.metrics,
        insights: feedback.insights,
        recommendations: feedback.recommendations,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async findByProject(projectId: string): Promise<Feedback[]> {
    const { data, error } = await this.supabase
      .from('feedback')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(this.mapToFeedback);
  }

  async findByContent(contentId: string): Promise<Feedback[]> {
    const { data, error } = await this.supabase
      .from('feedback')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(this.mapToFeedback);
  }

  private mapToFeedback(data: any): Feedback {
    return {
      id: data.id,
      projectId: data.project_id,
      contentId: data.content_id,
      metrics: data.metrics,
      insights: data.insights,
      recommendations: data.recommendations,
      createdAt: data.created_at,
    };
  }
}
