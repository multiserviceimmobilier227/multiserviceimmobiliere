import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { Database } from "@/integrations/supabase/types";

type AcquisitionCostCategory = Database["public"]["Enums"]["acquisition_cost_category"];

const acquisitionSchema = z.object({
  lotissement_id: z.string().uuid().optional().nullable(),
  plot_id: z.string().uuid().optional().nullable(),
  vendeur: z.string().min(1),
  date_achat: z.string(),
  prix_principal: z.number().min(0),
  status: z.string().default('En attente'),
});

const costSchema = z.object({
  acquisition_id: z.string().uuid(),
  category: z.enum(['Prix Achat', 'Frais Acte', 'Géomètre', 'Commission', 'Taxe', 'Autre']),
  amount: z.number().min(0),
  date: z.string(),
  description: z.string().optional().nullable(),
  proof_url: z.string().optional().nullable(),
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
    return data;
  });

export const createAcquisition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => acquisitionSchema.parse(data))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      lotissement_id: input.lotissement_id ?? null,
      plot_id: input.plot_id ?? null,
      vendeur: input.vendeur,
      date_achat: input.date_achat,
      prix_principal: input.prix_principal,
      status: input.status,
    };

    const { data, error } = await supabaseAdmin
      .from("acquisitions")
      .insert(payload)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  });

export const addAcquisitionCost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => costSchema.parse(data))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      acquisition_id: input.acquisition_id,
      category: input.category as AcquisitionCostCategory,
      amount: input.amount,
      date: input.date,
      description: input.description ?? null,
      proof_url: input.proof_url ?? null,
    };

    const { data, error } = await supabaseAdmin
      .from("acquisition_costs")
      .insert(payload)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  });

export const getProfitabilityReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("lotissement_profitability")
      .select("*");
    
    if (error) throw new Error(error.message);
    return data;
  });
