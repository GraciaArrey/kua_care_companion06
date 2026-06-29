
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
