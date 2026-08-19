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
  .inputValidator((data) => z.object({ 
    search: z.string().optional(),
    agenceId: z.string().optional() 
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    let query = supabase.from("clients").select("*");
    
    if (data.search) {
      query = query.or(`first_name.ilike.%${data.search}%,last_name.ilike.%${data.search}%,phone.ilike.%${data.search}%`);
    }
    
    const { data: clients, error } = await query.order("last_name", { ascending: true });
    if (error) throw error;
    return clients;
  });

export const getClientDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const [clientRes, docsRes, interactionsRes] = await Promise.all([
      supabase.from("clients").select("*").eq("id", data.id).single(),
      supabase.from("client_documents").select("*").eq("client_id", data.id).order("created_at", { ascending: false }),
      supabase.from("client_interactions").select("*").eq("client_id", data.id).order("interaction_date", { ascending: false })
    ]);

    if (clientRes.error) throw clientRes.error;

    return {
      ...clientRes.data,
      documents: docsRes.data || [],
      interactions: interactionsRes.data || []
    };
  });

export const upsertClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().optional(),
    client: clientSchema
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const supabase = supabaseAdmin;

    const updateData: any = {
      first_name: data.client.first_name,
      last_name: data.client.last_name,
      email: data.client.email ?? null,
      phone: data.client.phone,
      address: data.client.address ?? null,
      id_type: data.client.id_type,
      id_number: data.client.id_number ?? null,
      occupation: data.client.occupation ?? null,
      date_naissance: data.client.date_naissance ?? null,
      lieu_naissance: data.client.lieu_naissance ?? null,
      nationalite: data.client.nationalite ?? null,
      civilite: data.client.civilite ?? null,
      updated_at: new Date().toISOString(),
    };

    if (data.id) {
      updateData.id = data.id;
    }

    const { data: client, error } = await supabase
      .from("clients")
      .upsert(updateData)
      .select()
      .single();

    if (error) throw error;
    return client;
  });

export const addClientInteraction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    client_id: z.string(),
    interaction_type: z.string(),
    notes: z.string().optional(),
    interaction_date: z.string().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const supabase = supabaseAdmin;

    const { data: userRes } = await supabase.auth.getUser();
    const { data: interaction, error } = await supabase
      .from("client_interactions")
      .insert({
        client_id: data.client_id,
        interaction_type: data.interaction_type,
        notes: data.notes ?? null,
        interaction_date: data.interaction_date || new Date().toISOString(),
        user_id: userRes.user?.id!,
      })
      .select()
      .single();

    if (error) throw error;
    return interaction;
  });
