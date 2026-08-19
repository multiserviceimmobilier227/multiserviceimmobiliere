import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforcePermission } from "./permissions.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getSaleTransfers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((saleId: string) => z.string().uuid().parse(saleId))
  .handler(async ({ data: saleId, context }) => {
    await enforcePermission(context.userId, 'view_sales');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("sale_transfers")
      .select(`
        *,
        old_plot:plots!old_plot_id(plot_number, ilot:ilots(numero, zone:zones(name))),
        new_plot:plots!new_plot_id(plot_number, ilot:ilots(numero, zone:zones(name))),
        author:profiles(first_name, last_name)
      `)
      .eq("sale_id", saleId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  });

export const transferSalePlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    saleId: z.string().uuid(),
    newPlotId: z.string().uuid(),
    reason: z.string().min(5, "Le motif doit faire au moins 5 caractères")
  }).parse(data))
  .handler(async ({ data, context }) => {
    await enforcePermission(context.userId, 'transfer_plot');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // handle_plot_transfer is a SECURITY DEFINER function
    const { error } = await supabaseAdmin.rpc('handle_plot_transfer', {
      p_sale_id: data.saleId,
      p_new_plot_id: data.newPlotId,
      p_reason: data.reason,
      p_author_id: context.userId
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });
