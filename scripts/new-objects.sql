-- Run this in the Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT / DROP POLICY IF EXISTS.
-- Creates: child_milestones, caregiver_notes, and the card-images storage bucket.

-- === 20260630040000_child_milestones ===
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

-- === 20260630040100_caregiver_notes ===
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

-- === 20260630040200_card_images_bucket ===
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

