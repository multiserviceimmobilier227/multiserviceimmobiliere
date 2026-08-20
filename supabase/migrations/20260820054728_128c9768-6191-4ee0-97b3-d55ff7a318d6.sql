
-- Fix search_path and permissions for Phase 12 functions
ALTER FUNCTION public.fn_calculate_theoretical_cash(uuid) SET search_path = public;
ALTER FUNCTION public.fn_notify_pdg_on_large_expense() SET search_path = public;
ALTER FUNCTION public.fn_notify_pdg_on_cash_discrepancy() SET search_path = public;
ALTER FUNCTION public.fn_sync_cash_journal_balance() SET search_path = public;
ALTER FUNCTION public.fn_sync_cash_inflows() SET search_path = public;

-- Revoke public execute on sensitive functions
REVOKE EXECUTE ON FUNCTION public.fn_calculate_theoretical_cash(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_calculate_theoretical_cash(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.fn_notify_pdg_on_large_expense() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_notify_pdg_on_large_expense() TO service_role;

REVOKE EXECUTE ON FUNCTION public.fn_notify_pdg_on_cash_discrepancy() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_notify_pdg_on_cash_discrepancy() TO service_role;

REVOKE EXECUTE ON FUNCTION public.fn_sync_cash_journal_balance() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_sync_cash_journal_balance() TO service_role;

REVOKE EXECUTE ON FUNCTION public.fn_sync_cash_inflows() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_sync_cash_inflows() TO service_role;

-- Enable RLS on notifications if not already done
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for notifications: users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy for system/admin to create notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT TO authenticated, service_role
WITH CHECK (true);
