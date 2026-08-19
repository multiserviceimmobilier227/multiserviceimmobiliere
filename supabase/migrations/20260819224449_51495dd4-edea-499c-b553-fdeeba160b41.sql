-- 1. Réparation des privilèges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 2. Correction de la fonction has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 3. Mise à jour des politiques RLS
DROP POLICY IF EXISTS "Authenticated users can read clients" ON public.clients;
CREATE POLICY "Authenticated users can read clients" 
ON public.clients FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Staff can manage clients" ON public.clients;
CREATE POLICY "Staff can manage clients" 
ON public.clients FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'admin'));

-- S'assurer que les ventes sont lisibles
DROP POLICY IF EXISTS "Authenticated users can read sales" ON public.sales;
CREATE POLICY "Authenticated users can read sales" 
ON public.sales FOR SELECT 
TO authenticated 
USING (true);
