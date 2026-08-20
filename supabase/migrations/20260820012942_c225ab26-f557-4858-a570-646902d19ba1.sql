-- 1. Octroi des permissions explicites sur la table clients
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;

-- 2. Correction de la contrainte UNIQUE sur l'email qui bloque si vide
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS clients_email_unique_idx ON public.clients (email) WHERE email IS NOT NULL AND email != '';

-- 3. Mise à jour des politiques RLS
DROP POLICY IF EXISTS "Staff can manage clients" ON public.clients;
CREATE POLICY "Staff can manage clients" ON public.clients
FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'pdg') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'secretaire')
)
WITH CHECK (
  public.has_role(auth.uid(), 'pdg') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'secretaire')
);

-- 4. Ajout sécurisé du rôle secretaire à l'enum existant
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'secretaire';