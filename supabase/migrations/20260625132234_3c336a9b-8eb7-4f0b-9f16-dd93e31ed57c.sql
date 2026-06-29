
ALTER FUNCTION public.set_updated_at_timestamp() SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.set_updated_at_timestamp() FROM PUBLIC, anon, authenticated;
