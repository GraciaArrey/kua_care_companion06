create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  slug text not null check (slug in ('asd','personality','cognitive')),
  score_value numeric not null default 0,
  score_max numeric not null default 0,
  score_band text not null default 'low',
  headline text,
  summary text,
  answers jsonb not null default '{}'::jsonb,
  details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.test_results enable row level security;
create policy "own results select" on public.test_results for select using (auth.uid() = user_id);
create policy "own results insert" on public.test_results for insert with check (auth.uid() = user_id);
create policy "own results delete" on public.test_results for delete using (auth.uid() = user_id);
create index if not exists test_results_user_slug_idx on public.test_results(user_id, slug, created_at desc);