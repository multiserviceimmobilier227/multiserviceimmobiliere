
CREATE TABLE public.role_permissions (
    id uuid primary key default gen_random_uuid(),
    role public.app_role not null,
    permission text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(role, permission)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'informaticien'));

-- Initial seed based on current hardcoded matrix
INSERT INTO public.role_permissions (role, permission) VALUES
('pdg', 'view_dashboard'), ('pdg', 'manage_users'), ('pdg', 'manage_agences'), ('pdg', 'view_audit_logs'), 
('pdg', 'manage_settings'), ('pdg', 'view_lotissements'), ('pdg', 'create_lotissement'), ('pdg', 'manage_plots'),
('pdg', 'view_tarifs'), ('pdg', 'manage_tarifs'), ('pdg', 'view_acquisitions'), ('pdg', 'manage_acquisitions'),
('pdg', 'view_clients'), ('pdg', 'manage_clients'), ('pdg', 'manage_sales'), ('pdg', 'view_finance'), ('pdg', 'manage_finance'),
('informaticien', 'view_dashboard'), ('informaticien', 'manage_users'), ('informaticien', 'manage_agences'), ('informaticien', 'view_audit_logs'), 
('informaticien', 'manage_settings'), ('informaticien', 'view_lotissements'), ('informaticien', 'create_lotissement'), ('informaticien', 'manage_plots'),
('informaticien', 'view_tarifs'), ('informaticien', 'manage_tarifs'), ('informaticien', 'view_acquisitions'), ('informaticien', 'manage_acquisitions'),
('informaticien', 'view_clients'), ('informaticien', 'manage_clients'), ('informaticien', 'manage_sales'), ('informaticien', 'view_finance'), ('informaticien', 'manage_finance'),
('secretaire', 'view_dashboard'), ('secretaire', 'view_lotissements'), ('secretaire', 'create_lotissement'), ('secretaire', 'manage_plots'),
('secretaire', 'view_tarifs'), ('secretaire', 'view_clients'), ('secretaire', 'manage_clients'), ('secretaire', 'manage_sales'),
('commercial', 'view_dashboard'), ('commercial', 'view_lotissements'), ('commercial', 'manage_plots'), ('commercial', 'view_tarifs'), 
('commercial', 'view_clients'), ('commercial', 'manage_clients'), ('commercial', 'manage_sales'),
('comptable', 'view_dashboard'), ('comptable', 'view_finance'), ('comptable', 'manage_finance'), ('comptable', 'view_clients'), ('comptable', 'manage_sales'),
('responsable_agence', 'view_dashboard'), ('responsable_agence', 'view_lotissements'), ('responsable_agence', 'manage_plots'), ('responsable_agence', 'view_clients'), ('responsable_agence', 'manage_sales'), ('responsable_agence', 'view_finance'),
('client', 'view_dashboard');
