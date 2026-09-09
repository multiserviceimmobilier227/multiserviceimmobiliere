import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AccessProfile {
  authenticated: boolean;
  user_id?: string;
  full_name?: string | null;
  email?: string | null;
  roles: string[];
  is_super_admin?: boolean;
  permissions: string[];
  agency?: { id: string; name: string; city: string; code: string | null } | null;
}

const EMPTY: AccessProfile = { authenticated: false, roles: [], permissions: [] };

/**
 * Profil d'accès de l'utilisateur connecté : rôles, permissions et agence de rattachement.
 */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccessProfile> => {
    const { supabase, userId } = context!;
    if (!userId) return EMPTY;

    const { data, error } = await supabase.rpc("fn_my_access" as never);
    if (error) throw new Error(error.message);
    return (data as unknown as AccessProfile) ?? EMPTY;
  });

/**
 * Liste des utilisateurs (profils + rôles + agence). Réservé à la gestion des utilisateurs.
 */
export const listUserAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context!;
    const { data: allowed } = await supabase.rpc("has_permission" as never, {
      _user_id: userId,
      _permission: "manage_users",
    } as never);
    if (!allowed) throw new Error("Accès refusé : gestion des utilisateurs non autorisée.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, updated_at");
    if (error) throw new Error(error.message);

    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, created_at, agence_id, agences(name, code)");
    if (rolesError) throw new Error(rolesError.message);

    return (profiles ?? []).map((p) => ({
      ...p,
      roles: (roles ?? []).filter((r) => r.user_id === p.id),
    }));
  });

const ROLES = [
  "pdg",
  "comptable",
  "secretaire",
  "commercial",
  "responsable_agence",
  "informaticien",
  "client",
] as const;

/**
 * Création d'un compte utilisateur avec rôle et agence (permission manage_users requise).
 */
export const createUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        fullName: z.string().min(2),
        role: z.enum(ROLES),
        agenceId: z.string().uuid().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    const { data: allowed } = await supabase.rpc("has_permission" as never, {
      _user_id: userId,
      _permission: "manage_users",
    } as never);
    if (!allowed) throw new Error("Accès refusé : gestion des utilisateurs non autorisée.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error) throw new Error(error.message);
    const newUserId = created.user?.id;
    if (!newUserId) throw new Error("Création du compte impossible.");

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: newUserId, full_name: data.fullName, email: data.email });

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: newUserId, role: data.role, agence_id: data.agenceId ?? null },
        { onConflict: "user_id,role" },
      );
    if (roleError) throw new Error(roleError.message);

    return { id: newUserId, email: data.email };
  });

/**
 * Modification du rôle / de l'agence d'un utilisateur existant.
 */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(ROLES),
        agenceId: z.string().uuid().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    const { data: allowed } = await supabase.rpc("has_permission" as never, {
      _user_id: userId,
      _permission: "manage_users",
    } as never);
    if (!allowed) throw new Error("Accès refusé : gestion des utilisateurs non autorisée.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: data.userId, role: data.role, agence_id: data.agenceId ?? null },
        { onConflict: "user_id,role" },
      );
    if (error) throw new Error(error.message);
    return { success: true };
  });
