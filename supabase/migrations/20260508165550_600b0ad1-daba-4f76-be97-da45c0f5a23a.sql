create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  category text not null check (category in ('Schools','Parent groups','Emergency','Therapists','Other')),
  note text,
  address text,
  lat double precision not null,
  lng double precision not null,
  phone text,
  created_at timestamptz not null default now()
);
alter table public.places enable row level security;
create policy "own places select" on public.places for select using (auth.uid() = user_id);
create policy "own places insert" on public.places for insert with check (auth.uid() = user_id);
create policy "own places update" on public.places for update using (auth.uid() = user_id);
create policy "own places delete" on public.places for delete using (auth.uid() = user_id);
create index if not exists places_user_idx on public.places(user_id);