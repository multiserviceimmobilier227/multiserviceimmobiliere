import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const cleanupDuplicates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Check PDG/SuperAdmin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["pdg", "super_admin"])
      .single();

    if (!roleData) throw new Error("Accès refusé.");

    const { error } = await supabase
      .from("sales")
      .update({ 
        status: "annule", 
        notes: "Annulation automatique : doublon détecté" 
      })
      .eq("id", "39ba6d1e-c9ef-4348-93b7-5d0a9f3c8d20");

    if (error) throw error;
    return { success: true };
  });
