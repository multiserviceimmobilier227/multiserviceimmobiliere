import { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_agences'
  | 'view_audit_logs'
  | 'manage_settings'
  | 'view_lotissements'
  | 'create_lotissement'
  | 'manage_plots'
  | 'view_tarifs'
  | 'manage_tarifs'
  | 'view_acquisitions'
  | 'manage_acquisitions'
  | 'view_clients'
  | 'manage_clients'
  | 'manage_sales'
  | 'view_finance'
  | 'manage_finance';

export const ROLE_PERMISSIONS: Partial<Record<AppRole, Permission[]>> = {
  pdg: [
    'view_dashboard', 'manage_users', 'manage_agences', 'view_audit_logs', 
    'manage_settings', 'view_lotissements', 'create_lotissement', 'manage_plots',
    'view_tarifs', 'manage_tarifs', 'view_acquisitions', 'manage_acquisitions',
    'view_clients', 'manage_clients', 'manage_sales', 'view_finance', 'manage_finance'
  ],
  informaticien: [
    'view_dashboard', 'manage_users', 'manage_agences', 'view_audit_logs', 
    'manage_settings', 'view_lotissements', 'create_lotissement', 'manage_plots',
    'view_tarifs', 'manage_tarifs', 'view_acquisitions', 'manage_acquisitions',
    'view_clients', 'manage_clients', 'manage_sales', 'view_finance', 'manage_finance'
  ],
  secretaire: [
    'view_dashboard', 'view_lotissements', 'create_lotissement', 'manage_plots',
    'view_tarifs', 'view_clients', 'manage_clients', 'manage_sales'
  ],
  commercial: [
    'view_dashboard', 'view_lotissements', 'manage_plots', 'view_tarifs', 
    'view_clients', 'manage_clients', 'manage_sales'
  ],
  comptable: [
    'view_dashboard', 'view_finance', 'manage_finance', 'view_clients', 'manage_sales'
  ],
  responsable_agence: [
    'view_dashboard', 'view_lotissements', 'manage_plots', 'view_clients', 'manage_sales', 'view_finance'
  ],
  client: [
    'view_dashboard'
  ]
};

export function hasPermission(role: AppRole | null, permission: Permission, dynamicPermissions?: any[]): boolean {
  if (!role) return false;
  // PDG and Informaticien have all permissions
  if (role === 'pdg' || role === 'informaticien') return true;
  
  if (dynamicPermissions) {
    return dynamicPermissions.some(p => p.role === role && p.permission === permission);
  }
  
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

