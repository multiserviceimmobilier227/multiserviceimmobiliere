-- Migration pour finaliser la Phase 11 et sécuriser les fonctions SQL

-- 1. Sécuriser les fonctions critiques avec search_path et limiter l'exécution
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
ALTER FUNCTION public.fn_impute_payment_on_schedule(uuid, uuid, numeric) SET search_path = public;
ALTER FUNCTION public.fn_get_payment_imputation_preview(uuid, numeric) SET search_path = public;

-- 2. Grant explicite pour authenticated
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_impute_payment_on_schedule(uuid, uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_payment_imputation_preview(uuid, numeric) TO authenticated;

-- 3. Trigger pour les notifications de correction (Annule et Remplace)
CREATE OR REPLACE FUNCTION public.fn_notify_pdg_on_correction()
RETURNS TRIGGER AS $$
DECLARE
    v_pdg_id uuid;
    v_sale_id uuid;
BEGIN
    -- Récupérer le sale_id via le paiement
    SELECT sale_id INTO v_sale_id FROM public.payments WHERE id = NEW.payment_id;

    -- Trouver le PDG (ou premier admin) pour la notification
    SELECT user_id INTO v_pdg_id 
    FROM public.user_roles 
    WHERE role = 'pdg' 
    LIMIT 1;

    IF v_pdg_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            v_pdg_id,
            'Correction Financière',
            'Une correction de ' || NEW.new_amount || ' FCFA a été effectuée sur une vente.',
            'warning',
            '/ventes/' || v_sale_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_notify_pdg_on_correction ON public.payment_corrections;
CREATE TRIGGER tr_notify_pdg_on_correction
AFTER INSERT ON public.payment_corrections
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_pdg_on_correction();
