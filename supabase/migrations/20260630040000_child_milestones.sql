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
