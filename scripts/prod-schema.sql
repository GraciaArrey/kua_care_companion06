-- KUA Care Companion — consolidated production schema
-- Generated from supabase/migrations in timestamp order.
-- Paste into the Supabase SQL Editor (or use: supabase link && supabase db push).

-- ============================================================
-- 20260508145613_94547144-7c8f-4c7f-98e3-7430f618351d.sql
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_name TEXT,
  email TEXT,
  lang TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'light',
  calm BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, preferred_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'preferred_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ============================================================
-- 20260508145626_289e9a1b-b7c5-4c81-87b7-05f99d9bb613.sql
-- ============================================================

ALTER FUNCTION public.touch_updated_at() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;


-- ============================================================
-- 20260508155143_4e981be7-3c5b-49ad-9a8a-23e79cfcac28.sql
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE TABLE IF NOT EXISTS public.mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  mood text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date)
);
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own moods select" ON public.mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own moods insert" ON public.mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own moods update" ON public.mood_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own moods delete" ON public.mood_entries FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  time_of_day time,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reminders select" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own reminders insert" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own reminders update" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own reminders delete" ON public.reminders FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- 20260508163702_064457bc-cdc2-47fe-a5d1-d44d41181bf6.sql
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS caregiver_name text,
  ADD COLUMN IF NOT EXISTS caregiver_role text,
  ADD COLUMN IF NOT EXISTS child_name text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, preferred_name, child_name, caregiver_name, caregiver_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'child_name', NEW.raw_user_meta_data->>'preferred_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'child_name',
    NEW.raw_user_meta_data->>'caregiver_name',
    COALESCE(NEW.raw_user_meta_data->>'caregiver_role', 'caregiver')
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 20260508165550_600b0ad1-daba-4f76-be97-da45c0f5a23a.sql
-- ============================================================
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

-- ============================================================
-- 20260508170908_dd81489b-7801-4e5b-9827-3d0adf5c8dac.sql
-- ============================================================
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

-- ============================================================
-- 20260510204737_e6d80a6f-1fef-49ff-8ca0-4d4db199c3fa.sql
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS caregiver_objectives text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_child_id uuid;

CREATE TABLE IF NOT EXISTS public.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  preferred_name text,
  dob date,
  notes text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own children select" ON public.children;
DROP POLICY IF EXISTS "own children insert" ON public.children;
DROP POLICY IF EXISTS "own children update" ON public.children;
DROP POLICY IF EXISTS "own children delete" ON public.children;

CREATE POLICY "own children select" ON public.children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own children insert" ON public.children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own children update" ON public.children FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own children delete" ON public.children FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS children_touch_updated_at ON public.children;
CREATE TRIGGER children_touch_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.test_results
  ADD COLUMN IF NOT EXISTS child_id uuid;

CREATE INDEX IF NOT EXISTS test_results_child_id_idx ON public.test_results(child_id);
CREATE INDEX IF NOT EXISTS children_user_id_idx ON public.children(user_id);


-- ============================================================
-- 20260510215454_11ed3c4f-9ad3-4330-90d1-15349274352d.sql
-- ============================================================
ALTER TABLE public.mood_entries ADD COLUMN IF NOT EXISTS child_id uuid REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.mood_entries DROP CONSTRAINT IF EXISTS mood_entries_user_id_entry_date_key;
ALTER TABLE public.mood_entries DROP CONSTRAINT IF EXISTS mood_entries_user_child_date_key;
ALTER TABLE public.mood_entries ADD CONSTRAINT mood_entries_user_child_date_key UNIQUE NULLS NOT DISTINCT (user_id, child_id, entry_date);
CREATE INDEX IF NOT EXISTS mood_entries_child_idx ON public.mood_entries (child_id);

-- ============================================================
-- 20260513175329_576da36f-56ff-439b-8280-8c7a51fb4ce8.sql
-- ============================================================

-- App roles for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users see their own roles; admins see all
CREATE POLICY "own roles select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Allow first-admin self-claim if no admins exist yet
CREATE POLICY "claim first admin" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'admin'
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  );

CREATE POLICY "admin manage roles insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin manage roles delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Help bot conversation log
CREATE TABLE public.help_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  lang text NOT NULL DEFAULT 'en',
  source text NOT NULL DEFAULT 'gateway', -- 'gateway' | 'offline' | 'crisis'
  rating text, -- 'up' | 'down' | null
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  rated_at timestamptz
);

ALTER TABLE public.help_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own chats insert" ON public.help_chats
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own chats select" ON public.help_chats
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own chats update rating" ON public.help_chats
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin chats delete" ON public.help_chats
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX help_chats_created_idx ON public.help_chats (created_at DESC);
CREATE INDEX help_chats_user_idx ON public.help_chats (user_id);


-- ============================================================
-- 20260513175345_486a3773-41bb-4431-aa26-230536f5963c.sql
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;


-- ============================================================
-- 20260514060158_756d4fcb-4b06-47ca-961f-5fa4b838993e.sql
-- ============================================================

-- Extend role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';

-- Audits table
CREATE TABLE IF NOT EXISTS public.prompt_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  target_chat_id uuid,
  target_user_id uuid,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read audits"
  ON public.prompt_audits FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins insert audits"
  ON public.prompt_audits FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = actor_id);

CREATE INDEX IF NOT EXISTS idx_prompt_audits_created ON public.prompt_audits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_audits_actor   ON public.prompt_audits (actor_id);

-- Allow admins to read all profiles (for dashboard user details)
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all mood entries (for charts/oversight)
DROP POLICY IF EXISTS "admins read all moods" ON public.mood_entries;
CREATE POLICY "admins read all moods"
  ON public.mood_entries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ============================================================
-- 20260615055326_7b040c79-9d22-4750-88e7-f86f26bca160.sql
-- ============================================================

CREATE TYPE public.autism_center_category AS ENUM (
  'special_school','inclusive_school','therapy_center','ngo',
  'psychologist','speech_therapist','occupational_therapist',
  'pediatrician','support_group'
);

CREATE TYPE public.autism_center_verification AS ENUM ('pending','verified','rejected');

CREATE TABLE public.autism_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category public.autism_center_category NOT NULL,
  description TEXT,
  services_offered TEXT[] NOT NULL DEFAULT '{}',
  address TEXT,
  city TEXT,
  region TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  opening_hours TEXT,
  verification_status public.autism_center_verification NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.autism_centers TO anon, authenticated;
GRANT ALL ON public.autism_centers TO service_role;

ALTER TABLE public.autism_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified centers"
  ON public.autism_centers FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Admins can view all centers"
  ON public.autism_centers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert centers"
  ON public.autism_centers FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update centers"
  ON public.autism_centers FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete centers"
  ON public.autism_centers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER autism_centers_touch_updated_at
  BEFORE UPDATE ON public.autism_centers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX autism_centers_verification_idx ON public.autism_centers (verification_status);
CREATE INDEX autism_centers_category_idx ON public.autism_centers (category);
CREATE INDEX autism_centers_city_idx ON public.autism_centers (city);
CREATE INDEX autism_centers_region_idx ON public.autism_centers (region);


-- ============================================================
-- 20260624172830_26a38736-1e10-4ae2-8a64-1d83333f4d21.sql
-- ============================================================
-- Blog posts table for admin-managed articles
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_en text NOT NULL,
  title_fr text,
  category text NOT NULL DEFAULT 'Featured',
  read_minutes integer NOT NULL DEFAULT 5,
  excerpt_en text NOT NULL DEFAULT '',
  excerpt_fr text,
  body_en text[] NOT NULL DEFAULT '{}',
  body_fr text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert blog posts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update blog posts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete blog posts"
  ON public.blog_posts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_blog_posts_updated
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Lesson notes table for admin-managed lessons
CREATE TABLE public.lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  subject text NOT NULL DEFAULT 'general',
  title_en text NOT NULL,
  title_fr text,
  blurb_en text NOT NULL DEFAULT '',
  blurb_fr text,
  -- topics: jsonb array of { title_en, title_fr, minutes, definition_en, definition_fr, explanation_en, explanation_fr, examples_en (text[]), examples_fr (text[]) }
  topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.lesson_notes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lesson_notes TO authenticated;
GRANT ALL ON public.lesson_notes TO service_role;

ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published lessons"
  ON public.lesson_notes FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert lessons"
  ON public.lesson_notes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update lessons"
  ON public.lesson_notes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete lessons"
  ON public.lesson_notes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_lesson_notes_updated
  BEFORE UPDATE ON public.lesson_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Allow admins to manage autism_centers (insert/update/delete + read all statuses)
DROP POLICY IF EXISTS "Admins manage all centers" ON public.autism_centers;
DROP POLICY IF EXISTS "Admins read all centers" ON public.autism_centers;

CREATE POLICY "Admins read all centers"
  ON public.autism_centers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert centers"
  ON public.autism_centers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update centers"
  ON public.autism_centers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete centers"
  ON public.autism_centers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 20260625132222_f75a9e5d-d628-4c50-b84d-5a243d90b7de.sql
-- ============================================================

CREATE TABLE public.expression_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label_en TEXT NOT NULL,
  label_fr TEXT,
  category TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'primary',
  image_url TEXT,
  swatch TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.expression_cards TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.expression_cards TO authenticated;
GRANT ALL ON public.expression_cards TO service_role;

ALTER TABLE public.expression_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published expression cards"
  ON public.expression_cards FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert expression cards"
  ON public.expression_cards FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update expression cards"
  ON public.expression_cards FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete expression cards"
  ON public.expression_cards FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_expression_cards_updated_at
  BEFORE UPDATE ON public.expression_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE INDEX expression_cards_category_idx ON public.expression_cards (category, sort_order);


-- ============================================================
-- 20260625132234_3c336a9b-8eb7-4f0b-9f16-dd93e31ed57c.sql
-- ============================================================

ALTER FUNCTION public.set_updated_at_timestamp() SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.set_updated_at_timestamp() FROM PUBLIC, anon, authenticated;


-- ============================================================
-- 20260630040000_child_milestones.sql
-- ============================================================
-- Persistent growth milestone progress per child.
CREATE TABLE IF NOT EXISTS public.child_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  journey_slug text NOT NULL,
  milestone_key text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, journey_slug, milestone_key)
);

ALTER TABLE public.child_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own milestones select" ON public.child_milestones;
DROP POLICY IF EXISTS "own milestones insert" ON public.child_milestones;
DROP POLICY IF EXISTS "own milestones update" ON public.child_milestones;
DROP POLICY IF EXISTS "own milestones delete" ON public.child_milestones;

CREATE POLICY "own milestones select" ON public.child_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own milestones insert" ON public.child_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own milestones update" ON public.child_milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own milestones delete" ON public.child_milestones FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS child_milestones_touch_updated_at ON public.child_milestones;
CREATE TRIGGER child_milestones_touch_updated_at
  BEFORE UPDATE ON public.child_milestones
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS child_milestones_child_idx ON public.child_milestones(child_id);
CREATE INDEX IF NOT EXISTS child_milestones_user_idx ON public.child_milestones(user_id);


-- ============================================================
-- 20260630040100_caregiver_notes.sql
-- ============================================================
-- Cross-device caregiver notes (replaces localStorage-only vault).
CREATE TABLE IF NOT EXISTS public.caregiver_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.caregiver_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own notes select" ON public.caregiver_notes;
DROP POLICY IF EXISTS "own notes insert" ON public.caregiver_notes;
DROP POLICY IF EXISTS "own notes update" ON public.caregiver_notes;
DROP POLICY IF EXISTS "own notes delete" ON public.caregiver_notes;

CREATE POLICY "own notes select" ON public.caregiver_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own notes insert" ON public.caregiver_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notes update" ON public.caregiver_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own notes delete" ON public.caregiver_notes FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS caregiver_notes_touch_updated_at ON public.caregiver_notes;
CREATE TRIGGER caregiver_notes_touch_updated_at
  BEFORE UPDATE ON public.caregiver_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS caregiver_notes_user_idx ON public.caregiver_notes(user_id);


-- ============================================================
-- 20260630040200_card_images_bucket.sql
-- ============================================================
-- Public storage bucket for expression-card images uploaded from device.
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read (cards are shown publicly on /communication).
DROP POLICY IF EXISTS "card-images public read" ON storage.objects;
CREATE POLICY "card-images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-images');

-- Only admins may upload / change / remove card images.
DROP POLICY IF EXISTS "card-images admin insert" ON storage.objects;
CREATE POLICY "card-images admin insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'card-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "card-images admin update" ON storage.objects;
CREATE POLICY "card-images admin update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'card-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "card-images admin delete" ON storage.objects;
CREATE POLICY "card-images admin delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'card-images' AND public.has_role(auth.uid(), 'admin'));


