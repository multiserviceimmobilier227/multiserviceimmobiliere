-- 1. Ajout de colonnes pour commentaires de validation
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS validation_notes text;

-- 2. Création de la table d'ajustements d'écarts de caisse
CREATE TABLE IF NOT EXISTS public.daily_cash_adjustments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id uuid REFERENCES public.cash_journals(id) ON DELETE CASCADE NOT NULL,
    amount numeric NOT NULL, -- L'écart constaté
    reason text NOT NULL,
    adjusted_by uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.daily_cash_adjustments TO authenticated;
GRANT ALL ON public.daily_cash_adjustments TO service_role;

ALTER TABLE public.daily_cash_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view adjustments of their agency journals" 
ON public.daily_cash_adjustments FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.cash_journals j
        JOIN public.user_roles ur ON j.agency_id = ur.agence_id
        WHERE j.id = daily_cash_adjustments.journal_id
        AND ur.user_id = auth.uid()
    )
);

CREATE POLICY "Only admins or agency managers can insert adjustments" 
ON public.daily_cash_adjustments FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('pdg', 'admin', 'moderator')
    )
);

-- Note: Les buckets storage doivent idéalement être créés via tool call, 
-- mais nous configurons les politiques SQL par précaution.
CREATE POLICY "Justificatifs access policy" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'justificatifs_depenses');
