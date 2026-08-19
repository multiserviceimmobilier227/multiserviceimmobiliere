-- Grant all existing permissions to PDG in the database
INSERT INTO public.role_permissions (role, permission)
SELECT 'pdg'::public.app_role, p
FROM unnest(ARRAY[
  'view_dashboard', 'manage_users', 'manage_agences', 'view_audit_logs', 
  'manage_settings', 'view_lotissements', 'create_lotissement', 'manage_plots',
  'view_tarifs', 'manage_tarifs', 'view_acquisitions', 'manage_acquisitions',
  'view_clients', 'manage_clients', 'manage_sales', 'view_sales', 'create_sale', 
  'adjust_sale', 'view_finance', 'manage_finance', 'view_expenses', 'manage_expenses',
  'validate_payments', 'view_reservations', 'create_reservation', 'manage_reservations',
  'manage_contracts', 'sign_contract', 'transfer_plot', 'request_price_adjustment',
  'validate_price_adjustment', 'validate_sensitive_op'
]) p
ON CONFLICT (role, permission) DO NOTHING;

-- Ensure RLS doesn't block the PDG even at DB level for their own metadata
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "PDG can see all roles" ON public.user_roles;
CREATE POLICY "PDG can see all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'pdg'));

DROP POLICY IF EXISTS "PDG can manage role permissions" ON public.role_permissions;
CREATE POLICY "PDG can manage role permissions" ON public.role_permissions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'pdg'));
