
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
