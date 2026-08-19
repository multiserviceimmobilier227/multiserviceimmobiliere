import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const acquisitionSchema = z.object({
  lotissement_id: z.string().uuid().optional().nullable(),
  plot_id: z.string().uuid().optional().nullable(),
  vendeur: z.string().min(1),
  date_achat: z.string(),
  prix_principal: z.number().min(0),
  status: z.string().default('En attente'),
});

export const getAcquisitions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("acquisitions")
      .select(`
        *,
        lotissement:lotissements(name),
        plot:plots(plot_number),
        costs:acquisition_costs(*)
      `)
      .order("date_achat", { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []) as any[];
  });

export const createAcquisition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => acquisitionSchema.parse(data))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("acquisitions")
      .insert({
        lotissement_id: input.lotissement_id ?? null,
        plot_id: input.plot_id ?? null,
        vendeur: input.vendeur,
        date_achat: input.date_achat,
        prix_principal: input.prix_principal,
        status: input.status,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  });

export const addAcquisitionCost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    acquisition_id: z.string().uuid(),
    category: z.enum(['Prix Achat', 'Frais Acte', 'Géomètre', 'Commission', 'Taxe', 'Autre']),
    amount: z.number().min(0),
    date: z.string(),
    description: z.string().optional().nullable(),
  }).parse(data))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("acquisition_costs")
      .insert({
        acquisition_id: input.acquisition_id,
        category: input.category,
        amount: input.amount,
        date: input.date,
        description: input.description ?? null,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    // 1. Monthly Sales Volume (Sum of total_amount for sales this month)
    const { data: salesVolume } = await supabaseAdmin
      .from("sales")
      .select("total_amount")
      .gte("sale_date", startOfMonthStr);

    // 2. Monthly Collections (Sum of deposits + sum of actual payments this month)
    
    // Sum of deposits from sales created this month
    const { data: deposits } = await supabaseAdmin
      .from("sales")
      .select("deposit_amount")
      .gte("sale_date", startOfMonthStr);

    // Sum of actual payments from the payments table this month
    const { data: payments } = await supabaseAdmin
      .from("payments")
      .select("amount")
      .gte("payment_date", startOfMonthStr);

    const totalSalesVolume = salesVolume?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
    const totalDeposits = deposits?.reduce((sum, s) => sum + Number(s.deposit_amount), 0) || 0;
    const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    return {
      monthlySales: totalSalesVolume,
      monthlyCollections: totalDeposits + totalPayments
    };
  });
