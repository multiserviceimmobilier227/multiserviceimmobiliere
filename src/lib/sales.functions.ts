import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforcePermission } from "./permissions.server";

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
        plot:plots(plot_number, ilot:ilots(numero, zone:zones(name, lotissement:lotissements(name)))),
        agency:agences(name)
      `)
      .order("created_at", { ascending: false });

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
    if (plot.status !== 'Disponible' && plot.status !== 'Réservée') {
      throw new Error("La parcelle n'est pas disponible pour la vente");
    }

    // 2. Create the sale
    const { data: sale, error: saleError } = await supabaseAdmin
      .from("sales")
      .insert({
        client_id: data.clientId,
        plot_id: data.plotId,
        agency_id: data.agencyId,
        payment_plan_type: data.paymentPlanType,
        total_price: data.totalPrice,
        down_payment_amount: data.downPaymentAmount,
        status: 'en_attente_apport',
        created_by: context.userId
      })
      .select()
      .single();

    if (saleError) throw new Error(saleError.message);

    // 3. Update reservation if exists
    await supabaseAdmin
      .from("reservations")
      .update({ status: 'converted' })
      .match({ plot_id: data.plotId, client_id: data.clientId, status: 'active' });

    return sale;
  });

export const getSaleById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id, context }) => {
    await enforcePermission(context.userId, 'view_sales');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("sales")
      .select(`
        *,
        client:clients(*),
        plot:plots(*, ilot:ilots(*, zone:zones(*, lotissement:lotissements(*)))),
        agency:agences(*),
        adjustments:sale_adjustments(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  });
