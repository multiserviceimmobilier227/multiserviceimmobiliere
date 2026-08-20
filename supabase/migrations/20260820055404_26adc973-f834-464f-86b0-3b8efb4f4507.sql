
REVOKE EXECUTE ON FUNCTION public.fn_calculate_theoretical_cash(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_notify_pdg(text, text, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_sync_journal_balance() FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_lock_closed_cash_journal() FROM public;

GRANT EXECUTE ON FUNCTION public.fn_calculate_theoretical_cash(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_notify_pdg(text, text, uuid) TO authenticated;

-- Ensure search_path on functions used in triggers (already done in some but good to be explicit)
ALTER FUNCTION public.fn_tr_notify_pdg_large_expense() SET search_path = public;
ALTER FUNCTION public.fn_tr_notify_pdg_cash_discrepancy() SET search_path = public;
ALTER FUNCTION public.fn_prevent_deletion() SET search_path = public;
