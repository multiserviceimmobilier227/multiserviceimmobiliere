-- 1. Amélioration du moteur d'imputation pour gérer l'anticipation
CREATE OR REPLACE FUNCTION public.fn_impute_payment_on_schedule(
    p_payment_id UUID,
    p_sale_id UUID,
    p_amount NUMERIC(15,2)
) RETURNS JSONB AS $$
DECLARE
    v_remaining_amount NUMERIC(15,2) := p_amount;
    v_imputed_items JSONB := '[]'::jsonb;
    v_schedule RECORD;
    v_apply NUMERIC(15,2);
    v_needed NUMERIC(15,2);
    v_new_paid NUMERIC(15,2);
BEGIN
    -- 1. Priorité aux retards et échéances non payées (FIFO)
    FOR v_schedule IN 
        SELECT id, amount_due, amount_paid, due_date
        FROM public.payment_schedules
        WHERE sale_id = p_sale_id 
          AND status != 'Payé'::public.schedule_status
        ORDER BY due_date ASC
    LOOP
        EXIT WHEN v_remaining_amount <= 0;
        
        v_needed := v_schedule.amount_due - COALESCE(v_schedule.amount_paid, 0);
        v_apply := LEAST(v_remaining_amount, v_needed);
        
        IF v_apply > 0 THEN
            v_new_paid := COALESCE(v_schedule.amount_paid, 0) + v_apply;
            
            UPDATE public.payment_schedules
            SET amount_paid = v_new_paid,
                status = CASE 
                    WHEN v_new_paid >= v_schedule.amount_due THEN 'Payé'::public.schedule_status 
                    WHEN v_new_paid > 0 THEN 'Partiel'::public.schedule_status
                    ELSE status
                END,
                updated_at = now()
            WHERE id = v_schedule.id;
            
            v_imputed_items := v_imputed_items || jsonb_build_object(
                'schedule_id', v_schedule.id,
                'due_date', v_schedule.due_date,
                'amount_applied', v_apply,
                'type', CASE WHEN v_schedule.due_date < CURRENT_DATE THEN 'Retard' ELSE 'Anticipation/Courant' END
            );
            
            v_remaining_amount := v_remaining_amount - v_apply;
        END IF;
    END LOOP;

    -- Si il reste de l'argent après avoir payé TOUTES les échéances (Solde Créditeur)
    IF v_remaining_amount > 0 THEN
        v_imputed_items := v_imputed_items || jsonb_build_object(
            'type', 'SURPLUS',
            'amount_surplus', v_remaining_amount,
            'notes', 'Paiement excédentaire mis en crédit client'
        );
    END IF;

    RETURN v_imputed_items;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Mise à jour du trigger de caisse : Uniquement au moment de la confirmation
CREATE OR REPLACE FUNCTION public.fn_sync_payment_to_cash()
RETURNS TRIGGER AS $$
DECLARE
    v_sale_agency_id UUID;
BEGIN
    -- On ne synchronise en caisse QUE si le paiement est confirmé
    IF NEW.confirmed_at IS NOT NULL AND (OLD.confirmed_at IS NULL OR TG_OP = 'INSERT') THEN
        SELECT agency_id INTO v_sale_agency_id FROM public.sales WHERE id = NEW.sale_id;

        INSERT INTO public.daily_cash_operations (
            agency_id,
            operation_type,
            amount,
            payment_method,
            reference_id,
            description,
            performed_by
        ) VALUES (
            v_sale_agency_id,
            'ENTREE',
            NEW.amount,
            NEW.method,
            NEW.id,
            'Encaissement vente ' || NEW.sale_id || ' (Confirmé)',
            NEW.confirmed_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_payment_to_cash ON public.payments;
CREATE TRIGGER tr_sync_payment_to_cash
AFTER INSERT OR UPDATE OF confirmed_at ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_payment_to_cash();

-- 3. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see their own notifications') THEN
        CREATE POLICY "Users can see their own notifications" ON public.notifications
        FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fn_notify_payment_registration()
RETURNS TRIGGER AS $$
DECLARE
    v_pdg_id UUID;
BEGIN
    IF NEW.confirmed_at IS NULL THEN
        FOR v_pdg_id IN 
            SELECT user_id FROM public.user_roles WHERE role IN ('pdg', 'super_admin')
        LOOP
            INSERT INTO public.notifications (
                user_id,
                title,
                message,
                type,
                link
            ) VALUES (
                v_pdg_id,
                'Nouvel encaissement à confirmer',
                'Un versement de ' || NEW.amount || ' FCFA a été saisi pour la vente ' || NEW.sale_id || ' et attend votre confirmation.',
                'PAYMENT_PENDING',
                '/ventes/' || NEW.sale_id
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_payment_registration ON public.payments;
CREATE TRIGGER tr_notify_payment_registration
AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_payment_registration();
