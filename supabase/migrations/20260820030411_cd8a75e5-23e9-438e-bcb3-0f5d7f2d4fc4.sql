-- Table pour journaliser tout mouvement de valeur (audit_finance)
CREATE TABLE IF NOT EXISTS public.audit_finance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id uuid REFERENCES public.sales(id),
    payment_id uuid REFERENCES public.payments(id),
    refund_id uuid REFERENCES public.refunds(id),
    operation_type text NOT NULL, -- 'vente', 'paiement', 'remboursement', 'annulation', 'ajustement'
    amount numeric NOT NULL,
    previous_balance numeric,
    new_balance numeric,
    user_id uuid REFERENCES auth.users(id),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_finance TO authenticated;
GRANT ALL ON public.audit_finance TO service_role;

ALTER TABLE public.audit_finance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view financial audit"
ON public.audit_finance FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Trigger pour libérer une parcelle lors de l'annulation d'une vente
CREATE OR REPLACE FUNCTION public.fn_handle_sale_cancellation()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND NEW.status = 'annule' AND OLD.status != 'annule') THEN
        -- Remettre la parcelle en disponible
        UPDATE public.plots 
        SET status = 'Disponible'
        WHERE id = NEW.plot_id;
        
        -- Journaliser l'annulation
        INSERT INTO public.audit_finance (
            sale_id, 
            operation_type, 
            amount, 
            previous_balance, 
            new_balance, 
            user_id, 
            notes
        ) VALUES (
            NEW.id, 
            'annulation', 
            -OLD.total_amount, 
            OLD.balance, 
            0, 
            auth.uid(), 
            'Annulation de la vente - Parcelle libérée'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_handle_sale_cancellation ON public.sales;
CREATE TRIGGER tr_handle_sale_cancellation
AFTER UPDATE ON public.sales
FOR EACH ROW
WHEN (NEW.status = 'annule')
EXECUTE FUNCTION public.fn_handle_sale_cancellation();

-- Trigger pour journaliser les nouveaux paiements dans audit_finance
CREATE OR REPLACE FUNCTION public.fn_audit_payment_creation()
RETURNS TRIGGER AS $$
DECLARE
    v_sale_balance numeric;
BEGIN
    SELECT balance INTO v_sale_balance FROM public.sales WHERE id = NEW.sale_id;
    
    INSERT INTO public.audit_finance (
        sale_id, 
        payment_id, 
        operation_type, 
        amount, 
        new_balance, 
        user_id
    ) VALUES (
        NEW.sale_id, 
        NEW.id, 
        'paiement', 
        NEW.amount, 
        v_sale_balance, 
        auth.uid()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_payment_creation ON public.payments;
CREATE TRIGGER tr_audit_payment_creation
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_payment_creation();
