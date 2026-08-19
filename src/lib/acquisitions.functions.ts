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

    // Get monthly sales
    const { data: monthlySales } = await supabaseAdmin
      .from("sales")
      .select("total_amount")
      .gte("sale_date", startOfMonth.toISOString().split('T')[0]);

    // Get monthly collections (payments) - assuming a 'payments' table exists or will exist
    // For now, let's use deposit_amount from recent sales as a proxy if payments table is missing
    const { data: collections } = await supabaseAdmin
      .from("sales")
      .select("deposit_amount")
      .gte("sale_date", startOfMonth.toISOString().split('T')[0]);

    const totalSales = monthlySales?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
    const totalCollections = collections?.reduce((sum, c) => sum + Number(c.deposit_amount), 0) || 0;

    return {
      monthlySales: totalSales,
      monthlyCollections: totalCollections
    };
  });
