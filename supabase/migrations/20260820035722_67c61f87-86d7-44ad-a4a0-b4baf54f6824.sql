-- Phase 11.1: Trésorerie & Audit Ledger
-- 1. Table des opérations de caisse quotidienne
CREATE TABLE IF NOT EXISTS public.daily_cash_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.agences(id),
    operation_date DATE DEFAULT CURRENT_DATE,
    operation_type TEXT CHECK (operation_type IN ('ENTREE', 'SORTIE')),
    amount NUMERIC(15,2) NOT NULL,
    payment_method TEXT NOT NULL, -- espece, virement, cheque, mobile_money
    reference_id UUID, -- Link to payment_id or expense_id
    description TEXT,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Extension de la table payments pour l'imputation fine
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS imputed_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES auth.users(id);

-- 3. Table des corrections de paiements (Zéro suppression)
CREATE TABLE IF NOT EXISTS public.payment_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    old_amount NUMERIC(15,2),
    new_amount NUMERIC(15,2),
    old_data JSONB,
    new_data JSONB,
    reason TEXT NOT NULL,
    corrected_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Permissions
GRANT SELECT, INSERT ON public.daily_cash_operations TO authenticated;
GRANT ALL ON public.daily_cash_operations TO service_role;
GRANT SELECT, INSERT ON public.payment_corrections TO authenticated;
GRANT ALL ON public.payment_corrections TO service_role;

ALTER TABLE public.daily_cash_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_corrections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins and accountants can view cash ops') THEN
        CREATE POLICY "Admins and accountants can view cash ops" 
        ON public.daily_cash_operations FOR SELECT TO authenticated
        USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'comptable') OR public.has_role(auth.uid(), 'super_admin'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins and accountants can view corrections') THEN
        CREATE POLICY "Admins and accountants can view corrections" 
        ON public.payment_corrections FOR SELECT TO authenticated
        USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'comptable') OR public.has_role(auth.uid(), 'super_admin'));
    END IF;
END $$;

-- Phase 11.2: Moteur d'Imputation FIFO
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
    -- 1. Priorité aux retards et échéances non payées
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
                'amount_applied', v_apply
            );
            
            v_remaining_amount := v_remaining_amount - v_apply;
        END IF;
    END LOOP;

    RETURN v_imputed_items;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour synchroniser la caisse lors d'un paiement
CREATE OR REPLACE FUNCTION public.fn_sync_payment_to_cash()
RETURNS TRIGGER AS $$
DECLARE
    v_sale_agency_id UUID;
BEGIN
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
        'Encaissement vente ' || NEW.sale_id,
        auth.uid()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_payment_to_cash ON public.payments;
CREATE TRIGGER tr_sync_payment_to_cash
AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_payment_to_cash();
