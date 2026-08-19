import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Schema definitions
const lotissementSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  agence_id: z.string().uuid().optional(),
  plan_communal: z.string().optional(),
  superficie_totale: z.number().optional(),
});

// Server functions
export const getLotissements = createServerFn({ method: "GET" })
  .handler(async () => {
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
  .validator((data: unknown) => lotissementSchema.parse(data))
  .handler(async ({ data: input }) => {
    const { data, error } = await supabaseAdmin
      .from("lotissements")
      .insert(input)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  });

export const getPlots = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ 
    lotissementId: z.string().uuid().optional(),
    ilotId: z.string().uuid().optional(),
    status: z.string().optional()
  }).optional().parse(data))
  .handler(async ({ data: input }) => {
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
      query = query.eq("status", input.status);
    }

    const { data, error } = await query.order("plot_number");
    
    if (error) throw new Error(error.message);
    return data;
  });

export const updatePlotStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    plotId: z.string().uuid(),
    newStatus: z.string(),
    reason: z.string().optional(),
    userId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data: input }) => {
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
      .update({ status: input.newStatus as any })
      .eq("id", input.plotId);
    
    if (updateError) throw new Error(updateError.message);

    // 3. Create status history entry
    const { error: historyError } = await supabaseAdmin
      .from("plot_status_history")
      .insert({
        plot_id: input.plotId,
        old_status: plot.status as any,
        new_status: input.newStatus as any,
        user_id: input.userId,
        reason: input.reason
      });
    
    if (historyError) throw new Error(historyError.message);

    return { success: true };
  });

export const getZonesByLotissement = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.string().uuid().parse(data))
  .handler(async ({ data: input }) => {
    const { data, error } = await supabaseAdmin
      .from("zones")
      .select("*, ilots(*)")
      .eq("lotissement_id", input);
    
    if (error) throw new Error(error.message);
    return data;
  });
