import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Check if the current authenticated user has a specific role.
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
 * Assign a role and optionally an agence to a user (Informaticien only)
 */
export const assignUserRole = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string().uuid(),
    role: z.enum(['pdg', 'comptable', 'secretaire', 'commercial', 'responsable_agence', 'informaticien', 'client']),
    agenceId: z.string().uuid().optional()
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { error } = await supabaseAdmin
      .from('user_roles')
      .upsert({ 
        user_id: data.userId, 
        role: data.role,
        agence_id: data.agenceId ?? null
      }, { onConflict: 'user_id,role' });


    if (error) throw error;
    return { success: true };
  });

/**
 * Get all users with their roles
 */
export const getUsersWithRoles = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('*, agences(name)');

    if (error) throw error;
    return data;
  });

/**
 * Get audit logs
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

/**
 * CRUD Agences
 */
export const getAgences = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from('agences')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  });

export const createAgence = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    name: z.string(),
    city: z.string(),
    address: z.string().optional(),
    phone: z.string().optional()
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: agence, error } = await supabaseAdmin
      .from('agences')
      .insert({
        name: data.name,
        city: data.city,
        address: data.address ?? null,
        phone: data.phone ?? null
      })
      .select()
      .single();

    if (error) throw error;
    return agence;
  });

/**
 * Business Settings
 */
export const getAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('*');
    if (error) throw error;
    return data;
  });

export const updateBusinessRules = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    rules: z.object({
      recommended_down_payment_pct: z.number(),
      payment_durations_months: z.array(z.number()),
      cancellation_penalty_pct: z.number(),
      reservation_duration_days: z.number(),
      currency: z.string()
    })
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from('app_settings')
      .update({ value: data.rules })
      .eq('key', 'business_rules');
    if (error) throw error;
    return { success: true };
  });



