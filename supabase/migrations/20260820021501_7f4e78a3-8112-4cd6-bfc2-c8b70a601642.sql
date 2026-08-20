-- 1. Attribuer le rôle super_admin à l'utilisateur PDG
INSERT INTO public.user_roles (user_id, role)
VALUES ('d2a66474-30df-4d82-9b98-9dc39a8ec045', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Mise à jour de la fonction has_role pour supporter super_admin
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $f$
  SELECT EXISTS (
    SELECT 1
    from public.user_roles
    where user_id = _user_id
      AND (role::text = _role OR role::text = 'super_admin')
  )
$f$;

-- 3. Sécurisation de la fonction (Réponse au linter)
REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;

-- 4. Application massive des droits Super Admin sur toutes les tables existantes
-- Clients
DROP POLICY IF EXISTS "Super Admin all on clients" ON public.clients;
CREATE POLICY "Super Admin all on clients" ON public.clients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Sales
DROP POLICY IF EXISTS "Super Admin all on sales" ON public.sales;
CREATE POLICY "Super Admin all on sales" ON public.sales FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Plots
DROP POLICY IF EXISTS "Super Admin all on plots" ON public.plots;
CREATE POLICY "Super Admin all on plots" ON public.plots FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Payment Schedules
DROP POLICY IF EXISTS "Super Admin all on payment_schedules" ON public.payment_schedules;
CREATE POLICY "Super Admin all on payment_schedules" ON public.payment_schedules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Payments
DROP POLICY IF EXISTS "Super Admin all on payments" ON public.payments;
CREATE POLICY "Super Admin all on payments" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Agences
DROP POLICY IF EXISTS "Super Admin all on agences" ON public.agences;
CREATE POLICY "Super Admin all on agences" ON public.agences FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Audit Logs
DROP POLICY IF EXISTS "Super Admin all on audit_logs" ON public.audit_logs;
CREATE POLICY "Super Admin all on audit_logs" ON public.audit_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Lotissements
DROP POLICY IF EXISTS "Super Admin all on lotissements" ON public.lotissements;
CREATE POLICY "Super Admin all on lotissements" ON public.lotissements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Zones
DROP POLICY IF EXISTS "Super Admin all on zones" ON public.zones;
CREATE POLICY "Super Admin all on zones" ON public.zones FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Ilots
DROP POLICY IF EXISTS "Super Admin all on ilots" ON public.ilots;
CREATE POLICY "Super Admin all on ilots" ON public.ilots FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
