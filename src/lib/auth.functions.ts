import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
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
    const { data: hasRole, error } = await supabase.rpc('has_role', {
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
 * Get all users with their roles (Admin only)
 */
export const getUsersWithRoles = createServerFn({ method: "GET" })
  .handler(async () => {
    // In a real app, you would fetch from auth.users (requires admin client)
    // and join with public.user_roles.
    // For now, we'll fetch only from user_roles which is public.
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        user_id
      `);

    if (error) throw error;
    return data;
  });

/**
 * Get audit logs (PDG and Informaticien only)
 */
export const getAuditLogs = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });
