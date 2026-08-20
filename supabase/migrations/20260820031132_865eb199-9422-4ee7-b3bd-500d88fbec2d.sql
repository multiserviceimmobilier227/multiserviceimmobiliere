-- 1. Table des remboursements (si manquante)
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    sale_id UUID REFERENCES public.sales(id) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    reason TEXT,
    refund_date DATE DEFAULT CURRENT_DATE,
    method TEXT,
    created_by UUID REFERENCES auth.users(id)
);

GRANT SELECT, INSERT ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- 2. Fonction de gestion d'annulation de vente
CREATE OR REPLACE FUNCTION public.fn_handle_sale_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid NUMERIC;
BEGIN
    IF NEW.status = 'annule' AND OLD.status != 'annule' THEN
        -- Libérer la parcelle
        UPDATE public.plots 
        SET status = 'Disponible' 
        WHERE id = NEW.plot_id;
        
        -- Journaliser dans audit_finance
        INSERT INTO public.audit_finance (
            operation_type,
            amount,
            sale_id,
            user_id,
            notes
        ) VALUES (
            'annulation',
            NEW.total_amount,
            NEW.id,
            auth.uid(),
            'Annulation de vente - Parcelle libérée'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur sales
DROP TRIGGER IF EXISTS tr_on_sale_cancel ON public.sales;
CREATE TRIGGER tr_on_sale_cancel
AFTER UPDATE ON public.sales
FOR EACH ROW
WHEN (NEW.status = 'annule' AND OLD.status != 'annule')
EXECUTE FUNCTION public.fn_handle_sale_cancellation();

-- 3. Fonction d'audit automatique des paiements
CREATE OR REPLACE FUNCTION public.fn_audit_payment_creation()
RETURNS TRIGGER AS $$
DECLARE
    v_prev_balance NUMERIC;
BEGIN
    SELECT balance INTO v_prev_balance FROM public.sales WHERE id = NEW.sale_id;
    
    INSERT INTO public.audit_finance (
        operation_type,
        amount,
        payment_id,
        sale_id,
        user_id,
        previous_balance,
        new_balance
    ) VALUES (
        'paiement',
        NEW.amount,
        NEW.id,
        NEW.sale_id,
        auth.uid(),
        v_prev_balance + NEW.amount, -- La balance a déjà été déduite par le trigger métier ou server function ? 
        v_prev_balance
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
