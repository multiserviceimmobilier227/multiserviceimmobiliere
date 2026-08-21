DO $$
DECLARE r record;
BEGIN
  -- Les fonctions de trigger ne doivent jamais être appelables via l'API
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
      AND p.prorettype = 'trigger'::regtype
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon, authenticated, public', r.sig);
  END LOOP;

  -- Fonctions métier SECURITY DEFINER : jamais accessibles aux visiteurs anonymes
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
      AND p.prorettype <> 'trigger'::regtype
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon, public', r.sig);
  END LOOP;
END $$;

-- Fonctions internes non appelables depuis l'application
REVOKE ALL ON FUNCTION public.fn_notify_pdg(text, text, uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.fn_create_notification(uuid, text, text, text, uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.fn_calculate_theoretical_cash(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.check_financial_integrity() FROM authenticated;