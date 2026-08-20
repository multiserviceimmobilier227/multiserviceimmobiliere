import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const clientSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().min(1),
  address: z.string().optional().nullable(),
  id_type: z.enum(["cni", "passeport", "permis", "autre"]),
  id_number: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  date_naissance: z.string().optional().nullable(),
  lieu_naissance: z.string().optional().nullable(),
  nationalite: z.string().optional().nullable(),
  civilite: z.enum(["M.", "Mme", "Mlle"]).optional().nullable(),
});

export const getClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { 
    search?: string;
    agenceId?: string;
  }) => z.object({ 
    search: z.string().optional(),
    agenceId: z.string().optional() 
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    
    let query = supabase.from("clients").select(`
      *,
      sales:sales(count)
    `);
    
    if (data.search) {
      query = query.or(`first_name.ilike.%${data.search}%,last_name.ilike.%${data.search}%,phone.ilike.%${data.search}%`);
    }
    
    const { data: clients, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("getClients error:", error);
      throw error;
    }
    
    return clients.map(c => ({
      ...c,
      sales_count: (c.sales as any)?.[0]?.count || 0
    }));
  });

export const getClientDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string }) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", data.id)
      .single();

    if (clientError) {
      console.error("Error fetching client:", clientError);
      throw new Error("Client introuvable dans la base de données.");
    }

    const [docsRes, interactionsRes, salesRes] = await Promise.all([
      supabase.from("client_documents").select("*").eq("client_id", data.id).order("created_at", { ascending: false }),
      supabase.from("client_interactions").select("*").eq("client_id", data.id).order("interaction_date", { ascending: false }),
      supabase.from("sales").select(`
        *,
        plots (plot_number, surface_area, lotissements (name))
      `).eq("client_id", data.id).order("created_at", { ascending: false })
    ]);

    return {
      ...client,
      documents: docsRes.data || [],
      interactions: interactionsRes.data || [],
      sales: salesRes.data || []
    };
  });

export const upsertClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: {
    id?: string;
    client: any;
  }) => z.object({
    id: z.string().optional(),
    client: clientSchema
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    
    const email = data.client.email?.trim() || null;

    if (email) {
      const { data: existing } = await supabase
        .from("clients")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      
      if (existing && existing.id !== data.id) {
        throw new Error("Un client avec cet e-mail existe déjà.");
      }
    }

    // Phase 12.3: Check for duplicate phone
    const { data: phoneExisting } = await supabase
      .from("clients")
      .select("id")
      .eq("phone", data.client.phone.trim())
      .maybeSingle();
    
    if (phoneExisting && phoneExisting.id !== data.id) {
      throw new Error("Un client avec ce numéro de téléphone existe déjà.");
    }

    const updateData: any = {
      first_name: data.client.first_name,
      last_name: data.client.last_name,
      email: email,
      phone: data.client.phone,
      address: data.client.address || null,
      id_type: data.client.id_type,
      id_number: data.client.id_number || null,
      occupation: data.client.occupation || null,
      date_naissance: data.client.date_naissance || null,
      lieu_naissance: data.client.lieu_naissance || null,
      nationalite: data.client.nationalite || null,
      civilite: data.client.civilite || null,
      updated_at: new Date().toISOString(),
    };

    if (data.id) {
      updateData.id = data.id;
    }

    const { data: client, error } = await supabase
      .from("clients")
      .upsert({
        ...updateData,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      if (error.code === "23505") {
        throw new Error("Un client avec cet e-mail existe déjà.");
      }
      throw error;
    }
    return client;
  });

export const addClientInteraction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: {
    client_id: string;
    interaction_type: string;
    notes?: string;
    interaction_date?: string;
  }) => z.object({
    client_id: z.string(),
    interaction_type: z.string(),
    notes: z.string().optional(),
    interaction_date: z.string().optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: interaction, error } = await supabase
      .from("client_interactions")
      .insert({
        client_id: data.client_id,
        interaction_type: data.interaction_type,
        notes: data.notes ?? null,
        interaction_date: data.interaction_date || new Date().toISOString(),
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return interaction;
  });
