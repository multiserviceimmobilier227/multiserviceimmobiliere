-- 1. Nettoyage de public.apply_sale_adjustment
REVOKE ALL ON FUNCTION public.apply_sale_adjustment() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_sale_adjustment() FROM anon;
REVOKE ALL ON FUNCTION public.apply_sale_adjustment() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_sale_adjustment() TO service_role;

-- 2. Nettoyage de public.handle_plot_transfer
REVOKE ALL ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) TO service_role;

-- 3. Nettoyage des fonctions dans le schéma 'private'
REVOKE ALL ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_role(uuid, app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO service_role;

REVOKE ALL ON FUNCTION private.process_audit_log() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.process_audit_log() FROM authenticated;
GRANT EXECUTE ON FUNCTION private.process_audit_log() TO service_role;

REVOKE ALL ON FUNCTION private.prevent_validated_edit() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.prevent_validated_edit() FROM authenticated;
GRANT EXECUTE ON FUNCTION private.prevent_validated_edit() TO service_role;

REVOKE ALL ON FUNCTION private.update_sale_on_payment() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.update_sale_on_payment() FROM authenticated;
GRANT EXECUTE ON FUNCTION private.update_sale_on_payment() TO service_role;
