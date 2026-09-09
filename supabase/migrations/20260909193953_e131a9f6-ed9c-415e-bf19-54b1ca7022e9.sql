
-- 1. Permission checker (super_admin bypass)
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = 'super_admin'::app_role
  ) OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission = _permission
  );
$$;

REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;

-- 2. Access profile for the current user
CREATE OR REPLACE FUNCTION public.fn_my_access()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _result jsonb;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('authenticated', false, 'roles', '[]'::jsonb, 'permissions', '[]'::jsonb);
  END IF;

  SELECT jsonb_build_object(
    'authenticated', true,
    'user_id', _uid,
    'full_name', (SELECT p.full_name FROM public.profiles p WHERE p.id = _uid),
    'email', (SELECT p.email FROM public.profiles p WHERE p.id = _uid),
    'roles', COALESCE((SELECT jsonb_agg(DISTINCT ur.role::text) FROM public.user_roles ur WHERE ur.user_id = _uid), '[]'::jsonb),
    'is_super_admin', EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _uid AND ur.role = 'super_admin'::app_role),
    'permissions', CASE
      WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _uid AND ur.role = 'super_admin'::app_role)
        THEN COALESCE((SELECT jsonb_agg(DISTINCT rp.permission) FROM public.role_permissions rp), '[]'::jsonb)
      ELSE COALESCE((
        SELECT jsonb_agg(DISTINCT rp.permission)
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON rp.role = ur.role
        WHERE ur.user_id = _uid), '[]'::jsonb)
    END,
    'agency', (
      SELECT jsonb_build_object('id', a.id, 'name', a.name, 'city', a.city, 'code', a.code)
      FROM public.user_roles ur
      JOIN public.agences a ON a.id = ur.agence_id
      WHERE ur.user_id = _uid AND ur.agence_id IS NOT NULL
      ORDER BY ur.created_at
      LIMIT 1
    )
  ) INTO _result;

  RETURN _result;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_my_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_my_access() TO authenticated, service_role;

-- 3. Complete permission matrix per role
INSERT INTO public.role_permissions (role, permission) VALUES
  ('comptable','view_expenses'), ('comptable','manage_expenses'),
  ('comptable','view_sales'), ('comptable','register_payment'),
  ('comptable','view_arrears'), ('comptable','view_documents'),
  ('comptable','manage_refunds'), ('comptable','manage_cash_journal'),
  ('comptable','view_acquisitions'),
  ('pdg','register_payment'), ('pdg','view_arrears'), ('pdg','manage_arrears'),
  ('pdg','view_documents'), ('pdg','manage_refunds'), ('pdg','manage_cash_journal'),
  ('pdg','view_performance'), ('pdg','view_inventory'),
  ('informaticien','view_expenses'), ('informaticien','view_documents'),
  ('informaticien','view_performance'), ('informaticien','view_inventory'),
  ('informaticien','view_arrears'),
  ('secretaire','view_documents'), ('secretaire','view_sales'),
  ('secretaire','view_inventory'), ('secretaire','manage_reservations'),
  ('commercial','view_sales'), ('commercial','view_documents'),
  ('commercial','view_inventory'), ('commercial','view_arrears'),
  ('responsable_agence','view_sales'), ('responsable_agence','manage_clients'),
  ('responsable_agence','view_expenses'), ('responsable_agence','manage_expenses'),
  ('responsable_agence','view_arrears'), ('responsable_agence','view_documents'),
  ('responsable_agence','view_reservations'), ('responsable_agence','manage_reservations'),
  ('responsable_agence','view_tarifs'), ('responsable_agence','view_inventory'),
  ('responsable_agence','view_performance'), ('responsable_agence','manage_cash_journal'),
  ('responsable_agence','register_payment')
ON CONFLICT (role, permission) DO NOTHING;

-- 4. Attach any role row without an agency to the Maradi head office
UPDATE public.user_roles ur
SET agence_id = (SELECT id FROM public.agences WHERE code = 'MAR' LIMIT 1)
WHERE ur.agence_id IS NULL
  AND ur.role <> 'super_admin'::app_role
  AND ur.role <> 'client'::app_role;
