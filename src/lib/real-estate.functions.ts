import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { Database } from "@/integrations/supabase/types";

type PlotStatus = Database["public"]["Enums"]["plot_status_new"];

// Schema definitions
const lotissementSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  agence_id: z.string().uuid().optional().nullable(),
  plan_communal: z.string().optional().nullable(),
  superficie_totale: z.number().optional().nullable(),
});

// Server functions
export const getLotissements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("lotissements")
      .select(`
        *,
        agence:agences(name),
        zones(
          *,
          ilots(*)
        )
      `)
      .order("name");
    
    if (error) throw new Error(error.message);
    return data;
  });

export const createLotissement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => lotissementSchema.parse(data))
  .handler(async ({ data: input, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Check permissions
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .maybeSingle();

    const { hasPermission } = await import("@/lib/permissions");
    if (!hasPermission(userRole?.role as any, 'create_lotissement')) {
      throw new Error("Unauthorized: You do not have permission to create lotissements");
    }

    // Exact optional property types fix: ensure undefined becomes null for Supabase
    const payload = {
      name: input.name,
      location: input.location,
      agence_id: input.agence_id ?? null,
      plan_communal: input.plan_communal ?? null,
      superficie_totale: input.superficie_totale ?? null,
    };

    const { data, error } = await supabaseAdmin
      .from("lotissements")
      .insert(payload)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  });


export const getPlots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ 
    lotissementId: z.string().uuid().optional(),
    ilotId: z.string().uuid().optional(),
    status: z.string().optional()
  }).optional().parse(data))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin
      .from("plots")
      .select(`
        *,
        ilot:ilots(
          numero,
          zone:zones(
            name,
            lotissement:lotissements(name)
          )
        )
      `);
    
    if (input?.ilotId) {
      query = query.eq("ilot_id", input.ilotId);
    }
    
    if (input?.status) {
      query = query.eq("status", input.status as PlotStatus);
    }

    const { data, error } = await query.order("plot_number");
    
    if (error) throw new Error(error.message);
    return data;
  });

export const updatePlotStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    plotId: z.string().uuid(),
    newStatus: z.string(),
    reason: z.string().optional().nullable(),
    userId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data: input, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Check permissions
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .maybeSingle();

    const allowedRoles = ['pdg', 'informaticien', 'secretaire', 'commercial', 'comptable'];
    if (!userRole || !allowedRoles.includes(userRole.role)) {
      throw new Error("Unauthorized");
    }

    // 1. Get old status
    const { data: plot, error: fetchError } = await supabaseAdmin
      .from("plots")
      .select("status")
      .eq("id", input.plotId)
      .single();
    
    if (fetchError) throw new Error(fetchError.message);

    // 2. Update plot status
    const { error: updateError } = await supabaseAdmin
      .from("plots")
      .update({ status: input.newStatus as PlotStatus })
      .eq("id", input.plotId);
    
    if (updateError) throw new Error(updateError.message);

    // 3. Create status history entry
    const historyPayload = {
      plot_id: input.plotId,
      old_status: plot.status,
      new_status: input.newStatus as PlotStatus,
      user_id: input.userId,
      reason: input.reason ?? null
    };

    const { error: historyError } = await supabaseAdmin
      .from("plot_status_history")
      .insert(historyPayload);
    
    if (historyError) throw new Error(historyError.message);

    return { success: true };
  });

export const getZonesByLotissement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.string().uuid().parse(data))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("zones")
      .select("*, ilots(*)")
      .eq("lotissement_id", input);
    
    if (error) throw new Error(error.message);
    return data;
  });
