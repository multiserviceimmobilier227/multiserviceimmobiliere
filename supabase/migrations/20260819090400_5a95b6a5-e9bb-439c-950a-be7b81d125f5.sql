-- Agences table
CREATE TABLE IF NOT EXISTS public.agences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    city text NOT NULL DEFAULT 'Maradi',
    address text,
    phone text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add agence_id to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS agence_id uuid REFERENCES public.agences(id);

-- Expense Categories
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    is_system boolean DEFAULT false, -- If true, cannot be deleted
    created_at timestamptz DEFAULT now()
);

-- App Settings (key-value store for business rules)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    description text,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Sequences for document numbering
CREATE SEQUENCE IF NOT EXISTS public.receipt_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.contract_number_seq START 1;

-- Seed default settings
INSERT INTO public.app_settings (key, value, description) VALUES
('business_rules', '{
    "recommended_down_payment_pct": 30,
    "payment_durations_months": [15, 20],
    "cancellation_penalty_pct": 20,
    "reservation_duration_days": 15,
    "currency": "FCFA"
}'::jsonb, 'Règles métier globales')
ON CONFLICT (key) DO NOTHING;

-- Seed expense categories
INSERT INTO public.expense_categories (name, is_system) VALUES
('Loyer', true),
('Carburant', true),
('Salaires', true),
('Impôts', true),
('Fournitures Bureau', true),
('Maintenance', true)
ON CONFLICT (name) DO NOTHING;

-- RLS & Grants
ALTER TABLE public.agences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.agences TO authenticated;
GRANT ALL ON public.agences TO service_role;
GRANT SELECT ON public.expense_categories TO authenticated;
GRANT ALL ON public.expense_categories TO service_role;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- Policies
CREATE POLICY "PDG and Informaticien can manage agences" ON public.agences
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'informaticien'));

CREATE POLICY "All users can view active agences" ON public.agences
    FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "PDG and Informaticien can manage settings" ON public.app_settings
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'informaticien'));

CREATE POLICY "All users can view settings" ON public.app_settings
    FOR SELECT TO authenticated USING (true);

-- Triggers for Audit (using the universal function from Phase 2)
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('agences', 'expense_categories', 'app_settings')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger ON public.%I', t);
        EXECUTE format('CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.process_audit_log()', t);
    END LOOP;
END $$;
