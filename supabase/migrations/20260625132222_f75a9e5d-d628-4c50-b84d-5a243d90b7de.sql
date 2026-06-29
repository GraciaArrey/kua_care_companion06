
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
