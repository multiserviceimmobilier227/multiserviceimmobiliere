import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPriceTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabase
      .from("price_templates")
      .select("*")
      .order("surface_range_min", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  });

export const upsertPriceTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1),
        surface_range_min: z.number().min(0),
        surface_range_max: z.number().min(0),
        price_per_m2: z.number().min(0),
        is_active: z.boolean().default(true),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    // Exact optional property types fix
    const payload = {
      name: data.name,
      surface_range_min: data.surface_range_min,
      surface_range_max: data.surface_range_max,
      price_per_m2: data.price_per_m2,
      is_active: data.is_active,
      ...(data.id ? { id: data.id } : {}),
    };

    const { error } = await supabase.from("price_templates").upsert(payload);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getPlotPricingHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ plotId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: history, error } = await supabase
      .from("plot_pricing")
      .select(`
        *,
        validator:validated_by_id ( email ),
        preparer:prepared_by_id ( email )
      `)
      .eq("plot_id", data.plotId)
      .order("effective_date", { ascending: false });

    if (error) throw new Error(error.message);
    return history;
  });

export const preparePlotPricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        plot_id: z.string().uuid(),
        base_price: z.number().min(0),
        min_price: z.number().min(0).optional(),
        notes: z.string().optional(),
      })
      .parse(data)
  )
  .handler(async ({ data, context }) => {
    // Exact optional property types fix
    const payload = {
      plot_id: data.plot_id,
      base_price: data.base_price,
      min_price: data.min_price ?? null,
      notes: data.notes ?? null,
      prepared_by_id: context.userId,
      effective_date: new Date().toISOString(),
    };

    const { error } = await supabase.from("plot_pricing").insert(payload);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const validatePlotPricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        pricingId: z.string().uuid(),
        plotId: z.string().uuid(),
        basePrice: z.number(),
      })
      .parse(data)
  )
  .handler(async ({ data, context }) => {
    const { error: validationError } = await supabase
      .from("plot_pricing")
      .update({
        validated_by_id: context.userId,
        validation_date: new Date().toISOString(),
      })
      .eq("id", data.pricingId);

    if (validationError) throw new Error(validationError.message);

    const { error: syncError } = await supabase
      .from("plots")
      .update({ base_price: data.basePrice })
      .eq("id", data.plotId);

    if (syncError) throw new Error(syncError.message);

    return { success: true };
  });
