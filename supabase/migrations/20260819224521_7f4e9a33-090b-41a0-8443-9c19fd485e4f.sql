-- 1. Sécurisation de public.has_role
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- 2. Sécurisation de private.has_role
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO service_role;

-- 3. Sécurisation de handle_reservation_status_change
REVOKE EXECUTE ON FUNCTION public.handle_reservation_status_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_reservation_status_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_reservation_status_change() TO service_role;

-- 4. Sécurisation de process_audit_log (public et private)
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO service_role;

REVOKE EXECUTE ON FUNCTION private.process_audit_log() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.process_audit_log() TO authenticated;
GRANT EXECUTE ON FUNCTION private.process_audit_log() TO service_role;

-- 5. Sécurisation des autres fonctions sensibles avec signatures complètes
REVOKE EXECUTE ON FUNCTION public.apply_sale_adjustment() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_sale_adjustment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_sale_adjustment() TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION private.prevent_validated_edit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.prevent_validated_edit() TO authenticated;
GRANT EXECUTE ON FUNCTION private.prevent_validated_edit() TO service_role;

REVOKE EXECUTE ON FUNCTION private.update_sale_on_payment() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.update_sale_on_payment() TO authenticated;
GRANT EXECUTE ON FUNCTION private.update_sale_on_payment() TO service_role;
