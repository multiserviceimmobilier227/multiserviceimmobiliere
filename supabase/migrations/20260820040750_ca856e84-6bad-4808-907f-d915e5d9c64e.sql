-- 1. Finalisation de la table audit_finance
ALTER TABLE public.audit_finance ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agences(id);

-- 2. Fonction de prévisualisation de l'imputation (Calculatrice)
CREATE OR REPLACE FUNCTION public.fn_get_payment_imputation_preview(
    p_sale_id UUID,
    p_amount NUMERIC(15,2)
) RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_remaining_amount NUMERIC(15,2) := p_amount;
    v_imputed_items JSONB := '[]'::jsonb;
    v_schedule RECORD;
    v_needed NUMERIC(15,2);
    v_apply NUMERIC(15,2);
BEGIN
    -- Parcourir les échéances dues ou en retard
    FOR v_schedule IN 
        SELECT id, amount_due, amount_paid, due_date
        FROM public.payment_schedules
        WHERE sale_id = p_sale_id 
          AND status IN ('En attente', 'Partiel', 'Retard')
        ORDER BY due_date ASC
    LOOP
        EXIT WHEN v_remaining_amount <= 0;
        
        v_needed := v_schedule.amount_due - COALESCE(v_schedule.amount_paid, 0);
        v_apply := LEAST(v_remaining_amount, v_needed);
        
        IF v_apply > 0 THEN
            v_imputed_items := v_imputed_items || jsonb_build_object(
                'schedule_id', v_schedule.id,
                'due_date', v_schedule.due_date,
                'amount_applied', v_apply,
                'type', CASE WHEN v_schedule.due_date < CURRENT_DATE THEN 'Retard' ELSE 'Courant' END
            );
            v_remaining_amount := v_remaining_amount - v_apply;
        END IF;
    END LOOP;

    -- Si excédent, l'ajouter comme anticipation
    IF v_remaining_amount > 0 THEN
        v_imputed_items := v_imputed_items || jsonb_build_object(
            'schedule_id', NULL,
            'due_date', NULL,
            'amount_applied', v_remaining_amount,
            'type', 'Excédent / Anticipation'
        );
    END IF;

    RETURN v_imputed_items;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_payment_imputation_preview(UUID, NUMERIC) TO authenticated;

-- 3. Mise à jour du moteur d'imputation pour gérer les excédents
CREATE OR REPLACE FUNCTION public.fn_impute_payment_on_schedule(
    p_payment_id UUID,
    p_sale_id UUID,
    p_amount NUMERIC(15,2)
) RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_remaining_amount NUMERIC(15,2) := p_amount;
    v_imputed_items JSONB := '[]'::jsonb;
    v_schedule RECORD;
    v_apply NUMERIC(15,2);
    v_needed NUMERIC(15,2);
    v_new_paid NUMERIC(15,2);
BEGIN
    -- 1. Priorité aux échéances existantes
    FOR v_schedule IN 
        SELECT id, amount_due, amount_paid, due_date
        FROM public.payment_schedules
        WHERE sale_id = p_sale_id 
          AND status IN ('En attente', 'Partiel', 'Retard')
        ORDER BY due_date ASC
    LOOP
        EXIT WHEN v_remaining_amount <= 0;
        
        v_needed := v_schedule.amount_due - COALESCE(v_schedule.amount_paid, 0);
        v_apply := LEAST(v_remaining_amount, v_needed);
        
        IF v_apply > 0 THEN
            v_new_paid := COALESCE(v_schedule.amount_paid, 0) + v_apply;
            
            UPDATE public.payment_schedules
            SET amount_paid = v_new_paid,
                status = CASE WHEN v_new_paid >= v_schedule.amount_due THEN 'Payé'::public.schedule_status ELSE 'Partiel'::public.schedule_status END,
                updated_at = now()
            WHERE id = v_schedule.id;
            
            v_imputed_items := v_imputed_items || jsonb_build_object(
                'schedule_id', v_schedule.id,
                'due_date', v_schedule.due_date,
                'amount_applied', v_apply,
                'type', CASE WHEN v_schedule.due_date < CURRENT_DATE THEN 'Retard' ELSE 'Courant' END
            );
            
            v_remaining_amount := v_remaining_amount - v_apply;
        END IF;
    END LOOP;

    -- 2. Si excédent, il reste dans le balance de la vente (déjà géré par server function)
    -- On l'ajoute simplement dans le JSON de retour pour le reçu
    IF v_remaining_amount > 0 THEN
         v_imputed_items := v_imputed_items || jsonb_build_object(
            'schedule_id', NULL,
            'due_date', NULL,
            'amount_applied', v_remaining_amount,
            'type', 'Excédent / Anticipation'
        );
    END IF;

    -- Mettre à jour le paiement avec les données finales
    UPDATE public.payments 
    SET imputed_data = v_imputed_items 
    WHERE id = p_payment_id;

    RETURN v_imputed_items;
END;
$$;

-- 4. Hardening des triggers d'audit
CREATE OR REPLACE FUNCTION public.fn_audit_payment_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev_balance NUMERIC;
  v_agency_id UUID;
BEGIN
  SELECT balance, agency_id INTO v_prev_balance, v_agency_id FROM public.sales WHERE id = NEW.sale_id;
  
  INSERT INTO public.audit_finance (
    operation_type, amount, payment_id, sale_id, user_id,
    previous_balance, new_balance, agency_id, notes
  ) VALUES (
    'paiement', NEW.amount, NEW.id, NEW.sale_id, auth.uid(),
    v_prev_balance + NEW.amount, v_prev_balance, v_agency_id,
    'Encaissement versement N°' || NEW.id
  );
  RETURN NEW;
END;
$$;

-- Trigger pour les corrections (appelé manuellement par la server function ou via trigger sur payment_corrections)
CREATE OR REPLACE FUNCTION public.fn_audit_payment_correction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance NUMERIC;
  v_agency_id UUID;
  v_sale_id UUID;
BEGIN
  SELECT sale_id INTO v_sale_id FROM public.payments WHERE id = NEW.payment_id;
  SELECT balance, agency_id INTO v_balance, v_agency_id FROM public.sales WHERE id = v_sale_id;
  
  INSERT INTO public.audit_finance (
    operation_type, amount, payment_id, sale_id, user_id,
    previous_balance, new_balance, agency_id, notes
  ) VALUES (
    'CORRECTION_FINANCIERE', NEW.new_amount - NEW.old_amount, NEW.payment_id, v_sale_id, auth.uid(),
    v_balance - (NEW.new_amount - NEW.old_amount), v_balance, v_agency_id,
    'Correction de versement : ' || NEW.reason
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_audit_payment_correction ON public.payment_corrections;
CREATE TRIGGER tr_audit_payment_correction
AFTER INSERT ON public.payment_corrections
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_payment_correction();
