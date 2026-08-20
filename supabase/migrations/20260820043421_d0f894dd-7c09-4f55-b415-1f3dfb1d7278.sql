-- 1. Enum pour les statuts de dépense
DO $$ BEGIN
    CREATE TYPE public.expense_status AS ENUM ('brouillon', 'en_attente_validation', 'validé', 'rejeté');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Table des catégories de dépenses
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.expense_categories TO authenticated;
GRANT ALL ON public.expense_categories TO service_role;

-- 3. Table des journaux de caisse
CREATE TABLE IF NOT EXISTS public.cash_journals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id uuid REFERENCES public.agences(id) NOT NULL,
    opened_at timestamptz DEFAULT now(),
    closed_at timestamptz,
    opened_by_id uuid REFERENCES auth.users(id) NOT NULL,
    closed_by_id uuid REFERENCES auth.users(id),
    opening_balance numeric(15,2) NOT NULL DEFAULT 0,
    theoretical_closing_balance numeric(15,2) NOT NULL DEFAULT 0,
    actual_closing_balance numeric(15,2),
    discrepancy numeric(15,2),
    discrepancy_reason text,
    status text NOT NULL CHECK (status IN ('ouvert', 'fermé', 'en_attente_validation')) DEFAULT 'ouvert',
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.cash_journals TO authenticated;
GRANT ALL ON public.cash_journals TO service_role;

ALTER TABLE public.cash_journals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Admins et PDG voient tout sur les caisses"
    ON public.cash_journals FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'pdg'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Agents voient leur agence"
    ON public.cash_journals FOR SELECT TO authenticated
    USING (agency_id IN (SELECT agency_id FROM public.user_roles WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. Table des dépenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL DEFAULT current_date,
    amount numeric(15,2) NOT NULL CHECK (amount > 0),
    category_id uuid REFERENCES public.expense_categories(id) NOT NULL,
    description text NOT NULL,
    beneficiary text,
    payment_method text NOT NULL CHECK (payment_method IN ('espece', 'nita', 'virement', 'cheque', 'mobile_money')),
    agency_id uuid REFERENCES public.agences(id) NOT NULL,
    project_id uuid REFERENCES public.lotissements(id), 
    receipt_url text,
    status public.expense_status NOT NULL DEFAULT 'en_attente_validation',
    created_by_id uuid REFERENCES auth.users(id) NOT NULL,
    validated_by_id uuid REFERENCES auth.users(id),
    validation_date timestamptz,
    cash_journal_id uuid REFERENCES public.cash_journals(id),
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Super Admins et PDG voient toutes les dépenses"
    ON public.expenses FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'pdg'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Comptables et Admins voient leur agence"
    ON public.expenses FOR SELECT TO authenticated
    USING (agency_id IN (SELECT agency_id FROM public.user_roles WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Utilisateurs peuvent insérer des dépenses"
    ON public.expenses FOR INSERT TO authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. Journal d'audit spécifique pour les corrections financières
CREATE TABLE IF NOT EXISTS public.audit_finance_corrections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type text NOT NULL, 
    record_id uuid NOT NULL,
    old_data jsonb,
    new_data jsonb,
    reason text NOT NULL,
    corrected_by uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_finance_corrections TO authenticated;
GRANT ALL ON public.audit_finance_corrections TO service_role;

-- 6. Insertion des catégories système
INSERT INTO public.expense_categories (name, description) VALUES
('Salaires', 'Rémunération du personnel'),
('Loyer & Charges', 'Bureaux, électricité, eau'),
('Carburant', 'Frais de déplacement'),
('Impôts & Taxes', 'Obligations fiscales'),
('Communication', 'Téléphone, internet, marketing'),
('Fournitures', 'Papeterie, consommables'),
('Maintenance', 'Entretien des locaux et véhicules'),
('Divers', 'Autres dépenses non classées')
ON CONFLICT (name) DO NOTHING;
