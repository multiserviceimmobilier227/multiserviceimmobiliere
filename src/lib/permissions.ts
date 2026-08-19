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
  | 'view_sales'
  | 'create_sale'
  | 'adjust_sale'
  | 'view_finance'
  | 'manage_finance'
  | 'view_expenses'
  | 'manage_expenses'
  | 'validate_payments'
  | 'view_reservations'
  | 'create_reservation'
  | 'manage_reservations'
  | 'manage_contracts'
  | 'sign_contract'
  | 'transfer_plot'
  | 'request_price_adjustment'
  | 'validate_price_adjustment'
  | 'validate_sensitive_op';

export const ROLE_PERMISSIONS: Partial<Record<AppRole, Permission[]>> = {
  pdg: [
    'view_dashboard', 'manage_users', 'manage_agences', 'view_audit_logs', 
    'manage_settings', 'view_lotissements', 'create_lotissement', 'manage_plots',
    'view_tarifs', 'manage_tarifs', 'view_acquisitions', 'manage_acquisitions',
    'view_clients', 'manage_clients', 'manage_sales', 'view_sales', 'create_sale', 
    'adjust_sale', 'view_finance', 'manage_finance', 'view_expenses', 'manage_expenses',
    'validate_payments', 'view_reservations', 'create_reservation', 'manage_reservations',
    'manage_contracts', 'sign_contract', 'transfer_plot', 'request_price_adjustment',
    'validate_price_adjustment', 'validate_sensitive_op'
  ],
  informaticien: [
    'view_dashboard', 'manage_users', 'manage_agences', 'view_audit_logs', 
    'manage_settings', 'view_lotissements', 'create_lotissement', 'manage_plots',
    'view_tarifs', 'manage_tarifs', 'view_acquisitions', 'manage_acquisitions',
    'view_clients', 'manage_clients', 'manage_sales', 'view_sales', 'create_sale', 
    'adjust_sale', 'view_finance', 'manage_finance', 'view_expenses', 'manage_expenses',
    'validate_payments', 'view_reservations', 'create_reservation', 'manage_reservations',
    'manage_contracts', 'sign_contract', 'transfer_plot', 'request_price_adjustment',
    'validate_price_adjustment', 'validate_sensitive_op'
  ],
  admin: [
    'view_dashboard', 'manage_users', 'manage_agences', 'view_audit_logs', 
    'manage_settings', 'view_lotissements', 'create_lotissement', 'manage_plots',
    'view_tarifs', 'manage_tarifs', 'view_acquisitions', 'manage_acquisitions',
    'view_clients', 'manage_clients', 'manage_sales', 'view_sales', 'create_sale', 
    'adjust_sale', 'view_finance', 'manage_finance', 'view_expenses', 'manage_expenses',
    'validate_payments', 'view_reservations', 'create_reservation', 'manage_reservations',
    'manage_contracts', 'sign_contract', 'transfer_plot', 'request_price_adjustment',
    'validate_price_adjustment'
  ],
  secretaire: [
    'view_dashboard', 'view_lotissements', 'create_lotissement', 'manage_plots',
    'view_tarifs', 'view_clients', 'manage_clients', 'view_sales', 'create_sale', 
    'view_reservations', 'create_reservation', 'manage_contracts', 'request_price_adjustment'
  ],
  commercial: [
    'view_dashboard', 'view_lotissements', 'manage_plots', 'view_tarifs', 
    'view_clients', 'manage_clients', 'manage_sales', 'view_reservations', 'create_reservation'
  ],
  comptable: [
    'view_dashboard', 'view_finance', 'manage_finance', 'view_expenses', 'manage_expenses',
    'validate_payments', 'view_clients', 'view_sales', 'request_price_adjustment'
  ],
  responsable_agence: [
    'view_dashboard', 'view_lotissements', 'manage_plots', 'view_clients', 
    'manage_sales', 'view_sales', 'view_finance', 'view_reservations'
  ],
  client: [
    'view_dashboard'
  ]
};

export function hasPermission(role: AppRole | null, permission: Permission, dynamicPermissions?: any[]): boolean {
  // MASTER OVERRIDE: souleymaneoumarou2323@gmail.com is ALWAYS PDG and ALWAYS has all permissions
  // This is a hardcoded safety to prevent any configuration error from locking out the owner.
  if (role === 'pdg' || role === 'informaticien') return true;

  if (!role) return false;
  
  // Check dynamic permissions from database
  if (Array.isArray(dynamicPermissions) && dynamicPermissions.length > 0) {
    const hasDynamic = dynamicPermissions.some(p => p.role === role && p.permission === permission);
    if (hasDynamic) return true;
  }
  
  // Fallback to static permissions matrix
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
