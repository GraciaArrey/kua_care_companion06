ALTER TABLE public.mood_entries ADD COLUMN IF NOT EXISTS child_id uuid REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.mood_entries DROP CONSTRAINT IF EXISTS mood_entries_user_id_entry_date_key;
ALTER TABLE public.mood_entries DROP CONSTRAINT IF EXISTS mood_entries_user_child_date_key;
ALTER TABLE public.mood_entries ADD CONSTRAINT mood_entries_user_child_date_key UNIQUE NULLS NOT DISTINCT (user_id, child_id, entry_date);
CREATE INDEX IF NOT EXISTS mood_entries_child_idx ON public.mood_entries (child_id);