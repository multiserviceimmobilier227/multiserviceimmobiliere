import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AppRole, Permission } from "./permissions";

/**
 * Get the current permission matrix from the database
 */
export const getRolePermissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Check if caller is PDG or Informaticien
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .maybeSingle();

    if (callerRole?.role !== 'pdg' && callerRole?.role !== 'informaticien') {
      throw new Error("Unauthorized");
    }

    const { data: dbPermissions, error } = await supabaseAdmin
      .from('role_permissions')
      .select('*');

    if (error) {
      console.error("Error fetching permissions:", error);
      return [];
    }

    return dbPermissions;
  });

/**
 * Update a specific permission for a role
 */
export const updateRolePermission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    role: z.string(),
    permission: z.string(),
    enabled: z.boolean()
  }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check if caller is PDG or Informaticien
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .maybeSingle();

    if (callerRole?.role !== 'pdg' && callerRole?.role !== 'informaticien') {
      throw new Error("Unauthorized");
    }

    if (data.enabled) {
      const { error } = await supabaseAdmin
        .from('role_permissions')
        .upsert({ role: data.role, permission: data.permission });
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('role_permissions')
        .delete()
        .match({ role: data.role, permission: data.permission });
      if (error) throw error;
    }

    return { success: true };
  });
