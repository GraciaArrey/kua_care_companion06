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
