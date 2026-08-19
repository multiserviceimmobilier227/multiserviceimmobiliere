import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforcePermission } from "./permissions.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const saleSchema = z.object({
  clientId: z.string().uuid(),
  plotId: z.string().uuid(),
  agencyId: z.string().uuid(),
  paymentPlanType: z.enum(['comptant', 'echelonne']),
  totalPrice: z.number().positive(),
  downPaymentAmount: z.number().nonnegative(),
});

export const getSales = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await enforcePermission(context.userId, 'view_sales');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data, error } = await supabaseAdmin
      .from("sales")
      .select(`
        *,
        client:clients(first_name, last_name, phone),
        plot:plots(plot_number, ilot:ilots(numero, zone:zones(name, lotissement:lotissements(name))))
      `)
      .order("sale_date", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  });

export const createSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => saleSchema.parse(data))
  .handler(async ({ data, context }) => {
    await enforcePermission(context.userId, 'create_sale');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Verify plot is available or reserved by this client
    const { data: plot, error: plotError } = await supabaseAdmin
      .from("plots")
      .select("status")
      .eq("id", data.plotId)
      .single();

    if (plotError || !plot) throw new Error("Parcelle introuvable");
    
    const status = plot.status as string;
    if (status !== 'Disponible' && status !== 'Réservée') {
      throw new Error("La parcelle n'est pas disponible pour la vente");
    }

    // 2. Create the sale
    const { data: sale, error: saleError } = await (supabaseAdmin
      .from("sales")
      .insert({
        client_id: data.clientId,
        plot_id: data.plotId,
        payment_plan_type: data.paymentPlanType,
        total_price: data.totalPrice,
        balance: data.totalPrice - data.downPaymentAmount,
        down_payment: data.downPaymentAmount,
        status: 'en_cours',
        sale_date: new Date().toISOString()
      } as any) as any)
      .select()
      .single();

    if (saleError) throw new Error(saleError.message);

    // 3. Update reservation if exists
    await supabaseAdmin
      .from("reservations")
      .update({ status: 'converted' } as any)
      .match({ plot_id: data.plotId, client_id: data.clientId, status: 'active' });

    return sale;
  });

export const getSaleById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id, context }) => {
    await enforcePermission(context.userId, 'view_sales');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: sale, error } = await supabaseAdmin
      .from("sales")
      .select(`
        *,
        client:clients(*),
        plot:plots(*, ilot:ilots(*, zone:zones(*, lotissement:lotissements(*)))),
        adjustments:sale_adjustments(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return sale;
  });

export const transferSalePlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    saleId: z.string().uuid(),
    newPlotId: z.string().uuid(),
    reason: z.string().min(10)
  }).parse(data))
  .handler(async ({ data, context }) => {
    await enforcePermission(context.userId, 'transfer_plot');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.rpc('handle_plot_transfer', {
      p_sale_id: data.saleId,
      p_new_plot_id: data.newPlotId,
      p_reason: data.reason,
      p_author_id: context.userId
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });

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
        old_plot:plots!old_plot_id(plot_number),
        new_plot:plots!new_plot_id(plot_number),
        author:profiles(first_name, last_name)
      `)
      .eq("sale_id", saleId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  });
