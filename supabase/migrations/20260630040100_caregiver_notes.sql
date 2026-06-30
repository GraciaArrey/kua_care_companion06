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
