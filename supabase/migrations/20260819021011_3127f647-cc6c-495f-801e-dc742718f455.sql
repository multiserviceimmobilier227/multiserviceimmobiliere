
-- Phase 5: Ventes et Moteur Financier

-- 1. Create Payment Type and Status Enums
CREATE TYPE public.payment_method AS ENUM ('espece', 'virement', 'cheque', 'mobile_money');
CREATE TYPE public.sale_status AS ENUM ('reservation', 'en_cours', 'termine', 'annule');

-- 2. Create Sales/Contrats Table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) NOT NULL,
    plot_id UUID REFERENCES public.plots(id) NOT NULL,
    total_price NUMERIC NOT NULL, -- Total agreed price in FCFA
    down_payment NUMERIC DEFAULT 0, -- Initial payment
    balance NUMERIC NOT NULL, -- Remaining balance
    status sale_status DEFAULT 'reservation' NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Grants for sales
GRANT SELECT, INSERT, UPDATE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;

-- 4. Enable RLS on sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 5. Policies for sales
CREATE POLICY "Authenticated users can read sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage sales" ON public.sales FOR ALL TO authenticated 
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'moderator'));

-- 6. Create Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.sales(id) NOT NULL,
    amount NUMERIC NOT NULL, -- Amount paid in FCFA
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    method payment_method NOT NULL,
    reference TEXT, -- Receipt number, bank ref, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Grants for payments
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- 8. Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 9. Policies for payments
CREATE POLICY "Authenticated users can read payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can record payments" ON public.payments FOR INSERT TO authenticated 
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'moderator'));

-- 10. Trigger to update plot status and sale balance on payment
CREATE OR REPLACE FUNCTION private.update_sale_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.sales
    SET balance = balance - NEW.amount,
        updated_at = now()
    WHERE id = NEW.sale_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_sale_after_payment
AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION private.update_sale_on_payment();

-- 11. Audit triggers
CREATE TRIGGER audit_sales_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();

CREATE TRIGGER audit_payments_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
