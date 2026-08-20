-- Phase 14 — Remboursements

-- 1. Create the refunds table
CREATE TABLE public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id),
    client_id UUID NOT NULL REFERENCES public.clients(id),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    refund_date DATE NOT NULL DEFAULT CURRENT_DATE,
    method TEXT NOT NULL CHECK (method IN ('espece', 'virement', 'cheque', 'mobile_money')),
    reference TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Validé', 'Annulé')),
    validated_by UUID REFERENCES auth.users(id),
    validation_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create refund_schedules for staggered refunds
CREATE TABLE public.refund_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id),
    due_date DATE NOT NULL,
    amount_due DECIMAL(15,2) NOT NULL CHECK (amount_due > 0),
    amount_paid DECIMAL(15,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Partiel', 'Payé', 'Annulé')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add refund-related columns to sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS total_to_refund DECIMAL(15,2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'Aucun' CHECK (refund_status IN ('Aucun', 'En cours', 'Soldé', 'Annulé'));

-- 4. Audit Finance relation
-- audit_finance already has refund_id column

-- 5. Permissions
GRANT SELECT, INSERT, UPDATE ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.refund_schedules TO authenticated;
GRANT ALL ON public.refund_schedules TO service_role;

-- 6. RLS
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage refunds" ON public.refunds
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage refund schedules" ON public.refund_schedules
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'super_admin'));

-- 7. Trigger to handle sale cancellation and refund debt creation
CREATE OR REPLACE FUNCTION public.fn_handle_sale_refund_on_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid DECIMAL(15,2);
BEGIN
    -- Only act when sale status changes to 'annule'
    IF NEW.status = 'annule' AND OLD.status != 'annule' THEN
        -- Calculate total paid (deposit + confirmed payments)
        SELECT COALESCE(deposit_amount, 0) + COALESCE((SELECT SUM(amount) FROM public.payments WHERE sale_id = NEW.id AND confirmed_at IS NOT NULL), 0)
        INTO v_total_paid
        FROM public.sales
        WHERE id = NEW.id;

        -- Set the total to refund on the sale
        NEW.total_to_refund := v_total_paid;
        NEW.refund_status := 'En cours';

        -- Release the plot (already handled by existing trigger tr_handle_sale_cancellation)
        UPDATE public.plots SET status = 'Disponible' WHERE id = NEW.plot_id;

        -- Create an audit entry
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
        VALUES (auth.uid(), 'SALE_CANCELLED_REFUND_DUE', 'sales', NEW.id, jsonb_build_object('total_to_refund', v_total_paid));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_handle_sale_refund_on_cancellation
BEFORE UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.fn_handle_sale_refund_on_cancellation();

-- 8. View for remaining refunds (Phase 14.5 Alerte persistante)
CREATE OR REPLACE VIEW public.v_pending_refunds AS
SELECT 
    s.id AS sale_id,
    s.client_id,
    s.plot_id,
    c.first_name || ' ' || c.last_name AS client_name,
    p.number AS plot_number,
    l.name AS lotissement_name,
    s.total_to_refund,
    COALESCE((SELECT SUM(amount) FROM public.refunds WHERE sale_id = s.id AND status = 'Validé'), 0) AS total_refunded,
    s.total_to_refund - COALESCE((SELECT SUM(amount) FROM public.refunds WHERE sale_id = s.id AND status = 'Validé'), 0) AS balance_due,
    p.status AS current_plot_status
FROM public.sales s
JOIN public.clients c ON s.client_id = c.id
JOIN public.plots p ON s.plot_id = p.id
JOIN public.ilots i ON p.ilot_id = i.id
JOIN public.zones z ON i.zone_id = z.id
JOIN public.lotissements l ON z.lotissement_id = l.id
WHERE s.status = 'annule' AND s.total_to_refund > 0
AND (s.total_to_refund - COALESCE((SELECT SUM(amount) FROM public.refunds WHERE sale_id = s.id AND status = 'Validé'), 0)) > 0;

GRANT SELECT ON public.v_pending_refunds TO authenticated;
