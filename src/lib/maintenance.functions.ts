import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const cleanupDuplicates = createServerFn({ method: "POST" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("sales")
      .update({ 
        status: "annule", 
        notes: "Annulation automatique : doublon détecté lors de l'audit (Admin Mode)" 
      })
      .eq("id", "39ba6d1e-c9ef-4348-93b7-5d0a9f3c8d20");

    if (error) throw error;
    return { success: true };
  });
