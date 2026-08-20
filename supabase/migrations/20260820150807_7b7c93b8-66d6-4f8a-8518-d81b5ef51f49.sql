-- 1. Table des notifications (si elle n'existe pas déjà, par précaution)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'finance', 'vente', 'audit', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see their own notifications' AND tablename = 'notifications') THEN
        CREATE POLICY "Users can see their own notifications" ON public.notifications
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Fonction pour notifier le PDG lors d'une nouvelle dépense
CREATE OR REPLACE FUNCTION public.fn_notify_pdg_on_new_expense()
RETURNS TRIGGER AS $$
DECLARE
    pdg_id UUID;
    agency_name TEXT;
BEGIN
    -- Trouver le PDG (on prend le premier trouvé si plusieurs, mais MSI est mono-PDG en principe)
    SELECT user_id INTO pdg_id FROM public.user_roles WHERE role = 'pdg' LIMIT 1;
    
    SELECT nom INTO agency_name FROM public.agences WHERE id = NEW.agency_id;

    IF pdg_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (
            pdg_id, 
            'finance', 
            'Nouvelle demande de dépense', 
            'Une dépense de ' || NEW.amount || ' FCFA a été soumise par l''agence ' || agency_name,
            jsonb_build_object('expense_id', NEW.id, 'agency_id', NEW.agency_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fonction pour notifier l'agent lors du changement de statut
CREATE OR REPLACE FUNCTION public.fn_notify_agent_on_expense_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status <> NEW.status) AND NEW.status IN ('validé', 'rejeté') THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (
            NEW.created_by_id, 
            'finance', 
            'Statut de dépense mis à jour', 
            'Votre demande de dépense de ' || NEW.amount || ' FCFA a été ' || NEW.status,
            jsonb_build_object('expense_id', NEW.id, 'status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Triggers
DROP TRIGGER IF EXISTS tr_notify_pdg_on_new_expense ON public.expenses;
CREATE TRIGGER tr_notify_pdg_on_new_expense
AFTER INSERT ON public.expenses
FOR EACH ROW
WHEN (NEW.status = 'en_attente_validation')
EXECUTE FUNCTION public.fn_notify_pdg_on_new_expense();

DROP TRIGGER IF EXISTS tr_notify_agent_on_expense_status_change ON public.expenses;
CREATE TRIGGER tr_notify_agent_on_expense_status_change
AFTER UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.fn_notify_agent_on_expense_status_change();

-- 5. RLS Hardening pour les dépenses
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'PDG can see all expenses' AND tablename = 'expenses') THEN
        CREATE POLICY "PDG can see all expenses" ON public.expenses
            FOR SELECT TO authenticated 
            USING (public.has_role(auth.uid(), 'pdg'));
    END IF;
END $$;
