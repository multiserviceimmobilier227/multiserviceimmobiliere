-- Desactiver RLS temporairement pour debugger si le probleme vient de l'auth context
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- S'assurer que l'index unique sur l'email est conditionnel (deja fait mais on verifie)
DROP INDEX IF EXISTS clients_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS clients_email_key ON public.clients (email) WHERE (email IS NOT NULL);

-- Accorder les permissions explicitement
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
GRANT ALL ON public.clients TO anon;
