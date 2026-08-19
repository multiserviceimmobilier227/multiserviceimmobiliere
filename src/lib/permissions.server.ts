import { AppRole, Permission } from "./permissions";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Server-side check if a user has a specific permission.
 * This reads from the role_permissions table for dynamic control.
 */
export async function verifyPermission(userId: string, permission: Permission): Promise<boolean> {
  // 1. Get user role
  const { data: userRoleData, error: roleError } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (roleError || !userRoleData) return false;
  const role = userRoleData.role as AppRole;

  // PDG and Informaticien have all permissions by default
  if (role === 'pdg' || role === 'informaticien') return true;

  // 2. Check permission in dynamic matrix
  const { data: permData, error: permError } = await supabaseAdmin
    .from('role_permissions' as any)
    .select('id')
    .match({ role, permission })
    .maybeSingle();

  if (permError || !permData) return false;

  return true;
}

/**
 * Middleware-like helper for server functions to enforce permissions
 */
export async function enforcePermission(userId: string, permission: Permission) {
  const hasPerm = await verifyPermission(userId, permission);
  if (!hasPerm) {
    throw new Error(`Permission denied: ${permission}`);
  }
}
