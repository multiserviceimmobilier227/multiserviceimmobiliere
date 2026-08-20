ALTER FUNCTION public.fn_impute_payment_on_schedule(UUID, UUID, NUMERIC) SET search_path = public;
ALTER FUNCTION public.fn_sync_payment_to_cash() SET search_path = public;
ALTER FUNCTION public.fn_notify_payment_registration() SET search_path = public;

-- Revoke execute from public/anon if they are not meant to be called directly from client
REVOKE EXECUTE ON FUNCTION public.fn_impute_payment_on_schedule(UUID, UUID, NUMERIC) FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_sync_payment_to_cash() FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_notify_payment_registration() FROM public;

-- Grant execute only to authenticated if necessary, but these are mostly internal triggers or RPCs called via server functions
GRANT EXECUTE ON FUNCTION public.fn_impute_payment_on_schedule(UUID, UUID, NUMERIC) TO authenticated;
