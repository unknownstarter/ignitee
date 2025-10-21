-- Enhanced Database Schema for Ignitee MVP
-- Clean Architecture + CQRS + Event-Driven

-- ===== CORE TABLES =====

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  prd_text TEXT NOT NULL,
  industry VARCHAR(100),
  targets TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis table
CREATE TABLE IF NOT EXISTS analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  domain VARCHAR(100) NOT NULL,
  personas JSONB NOT NULL DEFAULT '[]',
  pains TEXT[] NOT NULL DEFAULT '[]',
  solution_map JSONB NOT NULL DEFAULT '[]',
  competitors JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategy table
CREATE TABLE IF NOT EXISTS strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  positioning JSONB NOT NULL,
  key_messages JSONB NOT NULL DEFAULT '[]',
  channel_mix JSONB NOT NULL DEFAULT '[]',
  funnel_hypothesis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Plan table
CREATE TABLE IF NOT EXISTS content_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  calendar JSONB NOT NULL DEFAULT '[]',
  channel_guides JSONB NOT NULL DEFAULT '[]',
  hooks JSONB NOT NULL DEFAULT '[]',
  hashtags JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Items table
CREATE TABLE IF NOT EXISTS content_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES content_plan(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  copy TEXT NOT NULL,
  media_prompt TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  external_post_id VARCHAR(255),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagement table
CREATE TABLE IF NOT EXISTS engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES content_item(id) ON DELETE CASCADE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr DECIMAL(5,4) NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== EVENT STORE =====

-- Domain Events table
CREATE TABLE IF NOT EXISTS domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  occurred_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1
);

-- Event Store Indexes
CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate_id ON domain_events(aggregate_id);
CREATE INDEX IF NOT EXISTS idx_domain_events_type ON domain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_domain_events_occurred_on ON domain_events(occurred_on);

-- ===== QUEUE TABLES =====

-- Job Queue table
CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  progress INTEGER NOT NULL DEFAULT 0,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Job Queue Indexes
CREATE INDEX IF NOT EXISTS idx_job_queue_status ON job_queue(status);
CREATE INDEX IF NOT EXISTS idx_job_queue_job_name ON job_queue(job_name);
CREATE INDEX IF NOT EXISTS idx_job_queue_created_at ON job_queue(created_at);

-- ===== CACHE TABLES =====

-- Cache table
CREATE TABLE IF NOT EXISTS cache (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache Indexes
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);

-- ===== AUDIT TABLES =====

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- ===== INDEXES =====

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Analysis indexes
CREATE INDEX IF NOT EXISTS idx_analysis_project_id ON analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_domain ON analysis(domain);

-- Strategy indexes
CREATE INDEX IF NOT EXISTS idx_strategy_project_id ON strategy(project_id);

-- Content Plan indexes
CREATE INDEX IF NOT EXISTS idx_content_plan_project_id ON content_plan(project_id);

-- Content Item indexes
CREATE INDEX IF NOT EXISTS idx_content_item_plan_id ON content_item(plan_id);
CREATE INDEX IF NOT EXISTS idx_content_item_channel ON content_item(channel);
CREATE INDEX IF NOT EXISTS idx_content_item_status ON content_item(status);
CREATE INDEX IF NOT EXISTS idx_content_item_scheduled_at ON content_item(scheduled_at);

-- Engagement indexes
CREATE INDEX IF NOT EXISTS idx_engagement_content_item_id ON engagement(content_item_id);
CREATE INDEX IF NOT EXISTS idx_engagement_captured_at ON engagement(captured_at);

-- ===== ROW LEVEL SECURITY =====

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Projects RLS Policies
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Analysis RLS Policies
CREATE POLICY "Users can view analysis for own projects" ON analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = analysis.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analysis for own projects" ON analysis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = analysis.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Strategy RLS Policies
CREATE POLICY "Users can view strategy for own projects" ON strategy
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = strategy.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert strategy for own projects" ON strategy
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = strategy.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Content Plan RLS Policies
CREATE POLICY "Users can view content plan for own projects" ON content_plan
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = content_plan.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert content plan for own projects" ON content_plan
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = content_plan.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Content Item RLS Policies
CREATE POLICY "Users can view content items for own projects" ON content_item
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_plan 
      JOIN projects ON projects.id = content_plan.project_id
      WHERE content_plan.id = content_item.plan_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert content items for own projects" ON content_item
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_plan 
      JOIN projects ON projects.id = content_plan.project_id
      WHERE content_plan.id = content_item.plan_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Engagement RLS Policies
CREATE POLICY "Users can view engagement for own projects" ON engagement
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_item 
      JOIN content_plan ON content_plan.id = content_item.plan_id
      JOIN projects ON projects.id = content_plan.project_id
      WHERE content_item.id = engagement.content_item_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Domain Events RLS Policies
CREATE POLICY "Users can view domain events for own projects" ON domain_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = domain_events.aggregate_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Audit Log RLS Policies
CREATE POLICY "Users can view own audit logs" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- ===== FUNCTIONS =====

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== VIEWS =====

-- Project Summary View
CREATE VIEW project_summary AS
SELECT 
  p.id,
  p.name,
  p.industry,
  p.created_at,
  a.domain,
  s.positioning,
  cp.calendar,
  COUNT(ci.id) as content_count,
  COUNT(e.id) as engagement_count
FROM projects p
LEFT JOIN analysis a ON a.project_id = p.id
LEFT JOIN strategy s ON s.project_id = p.id
LEFT JOIN content_plan cp ON cp.project_id = p.id
LEFT JOIN content_item ci ON ci.plan_id = cp.id
LEFT JOIN engagement e ON e.content_item_id = ci.id
GROUP BY p.id, p.name, p.industry, p.created_at, a.domain, s.positioning, cp.calendar;

-- Content Performance View
CREATE VIEW content_performance AS
SELECT 
  ci.id,
  ci.channel,
  ci.copy,
  ci.status,
  ci.published_at,
  e.impressions,
  e.clicks,
  e.ctr,
  e.likes,
  e.shares,
  e.comments,
  e.conversions,
  CASE 
    WHEN e.impressions > 0 THEN (e.likes + e.shares + e.comments)::DECIMAL / e.impressions
    ELSE 0
  END as engagement_rate
FROM content_item ci
LEFT JOIN engagement e ON e.content_item_id = ci.id
WHERE ci.status = 'published';

-- ===== STORED PROCEDURES =====

-- Get Project Analytics
CREATE OR REPLACE FUNCTION get_project_analytics(project_uuid UUID)
RETURNS TABLE (
  total_content INTEGER,
  total_impressions BIGINT,
  total_engagement BIGINT,
  avg_ctr DECIMAL,
  top_channel VARCHAR,
  recent_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(ci.id)::INTEGER as total_content,
    COALESCE(SUM(e.impressions), 0)::BIGINT as total_impressions,
    COALESCE(SUM(e.likes + e.shares + e.comments), 0)::BIGINT as total_engagement,
    COALESCE(AVG(e.ctr), 0) as avg_ctr,
    (
      SELECT ci2.channel 
      FROM content_item ci2 
      JOIN engagement e2 ON e2.content_item_id = ci2.id
      JOIN content_plan cp2 ON cp2.id = ci2.plan_id
      WHERE cp2.project_id = project_uuid
      GROUP BY ci2.channel
      ORDER BY SUM(e2.impressions) DESC
      LIMIT 1
    ) as top_channel,
    MAX(ci.created_at) as recent_activity
  FROM content_plan cp
  LEFT JOIN content_item ci ON ci.plan_id = cp.id
  LEFT JOIN engagement e ON e.content_item_id = ci.id
  WHERE cp.project_id = project_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== SAMPLE DATA =====

-- Insert sample project (for development)
INSERT INTO projects (id, owner_id, name, prd_text, industry, targets) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'CreatorAI',
  'AI-powered platform for content creators to generate ideas, optimize content, and grow their audience.',
  'Creator Tools',
  ARRAY['초보 크리에이터', '중급 크리에이터', '프로 크리에이터']
) ON CONFLICT (id) DO NOTHING;
