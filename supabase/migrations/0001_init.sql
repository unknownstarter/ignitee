-- Ignite 데이터베이스 초기화
-- 프로젝트, 분석, 전략, 콘텐츠, 피드백 테이블 생성

-- 프로젝트 테이블
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  prd_text text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 분석 테이블
create table if not exists public.analysis (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  domain text,
  personas jsonb,
  pains jsonb,
  solution_map jsonb,
  created_at timestamptz default now()
);

-- 전략 테이블
create table if not exists public.strategy (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  positioning jsonb,
  key_messages jsonb,
  channel_mix jsonb,
  created_at timestamptz default now()
);

-- 콘텐츠 테이블
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  platform text not null,
  title text not null,
  description text,
  type text not null check (type in ('educational', 'entertainment', 'behind-scenes', 'promotional')),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- 피드백 테이블
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  content_id uuid references public.content(id) on delete set null,
  metrics jsonb,
  insights jsonb,
  recommendations jsonb,
  created_at timestamptz default now()
);

-- 인덱스 생성
create index if not exists idx_projects_owner_id on public.projects(owner_id);
create index if not exists idx_analysis_project_id on public.analysis(project_id);
create index if not exists idx_strategy_project_id on public.strategy(project_id);
create index if not exists idx_content_project_id on public.content(project_id);
create index if not exists idx_content_platform on public.content(platform);
create index if not exists idx_content_status on public.content(status);
create index if not exists idx_feedback_project_id on public.feedback(project_id);
create index if not exists idx_feedback_content_id on public.feedback(content_id);

-- RLS (Row Level Security) 활성화
alter table public.projects enable row level security;
alter table public.analysis enable row level security;
alter table public.strategy enable row level security;
alter table public.content enable row level security;
alter table public.feedback enable row level security;

-- 프로젝트 RLS 정책
create policy "owner_select_projects" on public.projects
  for select using (auth.uid() = owner_id);

create policy "owner_insert_projects" on public.projects
  for insert with check (auth.uid() = owner_id);

create policy "owner_update_projects" on public.projects
  for update using (auth.uid() = owner_id);

create policy "owner_delete_projects" on public.projects
  for delete using (auth.uid() = owner_id);

-- 분석 RLS 정책
create policy "owner_select_analysis" on public.analysis
  for select using (
    exists(
      select 1 from public.projects p 
      where p.id = analysis.project_id 
      and p.owner_id = auth.uid()
    )
  );

create policy "owner_insert_analysis" on public.analysis
  for insert with check (
    exists(
      select 1 from public.projects p 
      where p.id = project_id 
      and p.owner_id = auth.uid()
    )
  );

create policy "owner_update_analysis" on public.analysis
  for update using (
    exists(
      select 1 from public.projects p 
      where p.id = analysis.project_id 
      and p.owner_id = auth.uid()
    )
  );

-- 전략 RLS 정책
create policy "owner_select_strategy" on public.strategy
  for select using (
    exists(
      select 1 from public.projects p 
      where p.id = strategy.project_id 
      and p.owner_id = auth.uid()
    )
  );

create policy "owner_insert_strategy" on public.strategy
  for insert with check (
    exists(
      select 1 from public.projects p 
      where p.id = project_id 
      and p.owner_id = auth.uid()
    )
  );

create policy "owner_update_strategy" on public.strategy
  for update using (
    exists(
      select 1 from public.projects p 
      where p.id = strategy.project_id 
      and p.owner_id = auth.uid()
    )
  );

-- 콘텐츠 RLS 정책
create policy "owner_select_content" on public.content
  for select using (
    exists(
      select 1 from public.projects p 
      where p.id = content.project_id 
      and p.owner_id = auth.uid()
    )
  );

create policy "owner_insert_content" on public.content
  for insert with check (
    exists(
      select 1 from public.projects p 
      where p.id = project_id 
      and p.owner_id = auth.uid()
    )
  );

create policy "owner_update_content" on public.content
  for update using (
    exists(
      select 1 from public.projects p 
      where p.id = content.project_id 
      and p.owner_id = auth.uid()
    )
  );

create policy "owner_delete_content" on public.content
  for delete using (
    exists(
      select 1 from public.projects p 
      where p.id = content.project_id 
      and p.owner_id = auth.uid()
    )
  );

-- 피드백 RLS 정책
create policy "owner_select_feedback" on public.feedback
  for select using (
    exists(
      select 1 from public.projects p 
      where p.id = feedback.project_id 
      and p.owner_id = auth.uid()
    )
  );

create policy "owner_insert_feedback" on public.feedback
  for insert with check (
    exists(
      select 1 from public.projects p 
      where p.id = project_id 
      and p.owner_id = auth.uid()
    )
  );

-- updated_at 자동 업데이트 함수
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 프로젝트 테이블에 updated_at 트리거 추가
create trigger update_projects_updated_at
  before update on public.projects
  for each row
  execute function update_updated_at_column();
