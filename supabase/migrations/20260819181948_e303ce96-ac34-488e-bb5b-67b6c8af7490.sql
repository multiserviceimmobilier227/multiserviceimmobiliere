-- Correction linter Phase 8
-- Set search_path for functions to public to avoid security warnings

ALTER FUNCTION public.prevent_validated_sale_edit() SET search_path = public;
ALTER FUNCTION public.update_plot_status_on_sale() SET search_path = public;

-- Revoke execute on public functions from public role
REVOKE EXECUTE ON FUNCTION public.prevent_validated_sale_edit() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_plot_status_on_sale() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.prevent_validated_sale_edit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_plot_status_on_sale() TO authenticated;
GRANT EXECUTE ON FUNCTION public.prevent_validated_sale_edit() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_plot_status_on_sale() TO service_role;
