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
