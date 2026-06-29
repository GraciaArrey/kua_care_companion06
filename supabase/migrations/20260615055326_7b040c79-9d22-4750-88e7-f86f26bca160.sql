
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
