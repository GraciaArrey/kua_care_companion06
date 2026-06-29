
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
