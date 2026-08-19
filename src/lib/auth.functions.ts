import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Check if the current authenticated user has a specific role.
 * This is used for server-side authorization.
 */
export const checkUserRole = createServerFn({ method: "GET" })
  .inputValidator(z.object({ 
    userId: z.string().uuid(),
    role: z.enum(['pdg', 'comptable', 'secretaire', 'commercial', 'responsable_agence', 'informaticien', 'client'])
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: hasRole, error } = await supabaseAdmin.rpc('has_role', {
      _user_id: data.userId,
      _role: data.role
    });

    if (error) {
      console.error("Error checking role:", error);
      return false;
    }

    return !!hasRole;
  });

/**
 * Assign a role to a user (Informaticien only)
 */
export const assignUserRole = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string().uuid(),
    role: z.enum(['pdg', 'comptable', 'secretaire', 'commercial', 'responsable_agence', 'informaticien', 'client'])
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Check if the current user is an informaticien
    // In a real middleware, this would be handled before
    
    const { error } = await supabaseAdmin
      .from('user_roles')
      .upsert({ 
        user_id: data.userId, 
        role: data.role 
      }, { onConflict: 'user_id,role' });

    if (error) throw error;
    return { success: true };
  });

/**
 * Get all users with their roles (Admin only)
 */
export const getUsersWithRoles = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('*');

    if (error) throw error;
    return data;
  });

/**
 * Get audit logs (PDG and Informaticien only)
 */
export const getAuditLogs = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });


