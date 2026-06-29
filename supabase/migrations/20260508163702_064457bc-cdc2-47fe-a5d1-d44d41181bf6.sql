ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS caregiver_name text,
  ADD COLUMN IF NOT EXISTS caregiver_role text,
  ADD COLUMN IF NOT EXISTS child_name text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, preferred_name, child_name, caregiver_name, caregiver_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'child_name', NEW.raw_user_meta_data->>'preferred_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'child_name',
    NEW.raw_user_meta_data->>'caregiver_name',
    COALESCE(NEW.raw_user_meta_data->>'caregiver_role', 'caregiver')
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();