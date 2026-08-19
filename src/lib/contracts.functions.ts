import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforcePermission } from "./permissions.server";

const frozenClientSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  cnib: z.string().optional(),
});

const frozenPlotSchema = z.object({
  plot_number: z.string(),
  ilot_number: z.string().optional(),
  zone_name: z.string().optional(),
  lotissement_name: z.string().optional(),
  surface: z.number().optional(),
});

const frozenPriceSchema = z.object({
  total_price: z.number(),
  down_payment: z.number(),
  balance: z.number(),
  payment_plan_type: z.string(),
});

export const generateContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((saleId: string) => z.string().uuid().parse(saleId))
  .handler(async ({ data: saleId, context }) => {
    await enforcePermission(context.userId, 'manage_contracts');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch sale data with all relations
    const { data: sale, error: saleError } = await supabaseAdmin
      .from("sales")
      .select(`
        *,
        client:clients(*),
        plot:plots(*, ilot:ilots(*, zone:zones(*, lotissement:lotissements(*))))
      `)
      .eq("id", saleId)
      .single();

    if (saleError || !sale) throw new Error("Vente introuvable");

    // Prepare frozen data
    const frozenClient = {
      first_name: sale.client.first_name,
      last_name: sale.client.last_name,
      phone: sale.client.phone,
      email: sale.client.email,
      cnib: (sale.client as any).cnib_number
    };

    const frozenPlot = {
      plot_number: sale.plot.plot_number,
      ilot_number: sale.plot.ilot?.numero,
      zone_name: sale.plot.ilot?.zone?.name,
      lotissement_name: sale.plot.ilot?.zone?.lotissement?.name,
      surface: sale.plot.surface
    };

    const frozenPrice = {
      total_price: sale.total_price,
      down_payment: sale.down_payment,
      balance: sale.balance,
      payment_plan_type: sale.payment_plan_type
    };

    // Create contract draft
    const { data: contract, error: contractError } = await (supabaseAdmin
      .from("contracts")
      .insert({
        sale_id: saleId,
        status: 'draft',
        frozen_client_data: frozenClient,
        frozen_plot_data: frozenPlot,
        frozen_price_data: frozenPrice,
        terms_and_conditions: "Conditions générales de vente MSI..."
      } as any) as any)
      .select()
      .single();

    if (contractError) throw new Error(contractError.message);

    return contract;
  });

export const signContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((contractId: string) => z.string().uuid().parse(contractId))
  .handler(async ({ data: contractId, context }) => {
    await enforcePermission(context.userId, 'sign_contract');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Generate contract number (MSI-YYYY-RANDOM)
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const contractNumber = `MSI-${year}-${random}`;

    // 2. Update contract
    const { data: contract, error: contractError } = await (supabaseAdmin
      .from("contracts")
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        contract_number: contractNumber
      } as any) as any)
      .eq("id", contractId)
      .select()
      .single();

    if (contractError) throw new Error(contractError.message);

    // 3. Update sale status if needed
    // In a real scenario, we might wait for the full payment or specific logic
    
    return contract;
  });

export const getContractBySaleId = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((saleId: string) => z.string().uuid().parse(saleId))
  .handler(async ({ data: saleId, context }) => {
    await enforcePermission(context.userId, 'manage_contracts');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: contract, error } = await supabaseAdmin
      .from("contracts")
      .select("*")
      .eq("sale_id", saleId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return contract;
  });
