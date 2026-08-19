import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Get the current permission matrix from the database
 */
export const getRolePermissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .maybeSingle();

    // All authenticated users can see permissions to hydrate the UI
    // but actual checks are enforced server-side for critical actions


    const { data: dbPermissions, error } = await supabaseAdmin
      .from('role_permissions' as any)
      .select('*');

    if (error) {
      console.error("Error fetching permissions:", error);
      return [];
    }

    return dbPermissions as any[];
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
        .from('role_permissions' as any)
        .upsert({ role: data.role as any, permission: data.permission });
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('role_permissions' as any)
        .delete()
        .match({ role: data.role, permission: data.permission });
      if (error) throw error;
    }

    return { success: true };
  });
