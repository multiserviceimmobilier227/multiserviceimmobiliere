
-- Fix linter warnings for apply_sale_adjustment
ALTER FUNCTION public.apply_sale_adjustment() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.apply_sale_adjustment() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_sale_adjustment() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_sale_adjustment() TO service_role;
