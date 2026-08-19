import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getGlobalSettings = createServerFn({ method: "GET" }).handler(async () => {
  return {
    currency: "FCFA",
    timezone: "Africa/Niamey",
    dateFormat: "DD/MM/YYYY",
    companyName: "Multi Services Immobilière",
    location: "Maradi, Niger",
  };
});

export const getAgences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("agences")
      .select("*")
      .eq("is_active", true)
      .order("name");
    
    if (error) throw new Error(error.message);
    return data;
  });
