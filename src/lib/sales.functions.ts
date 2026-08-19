import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { addMonths, format } from "date-fns";

const createSaleSchema = z.object({
  clientId: z.string().uuid(),
  plotId: z.string().uuid(),
  totalAmount: z.number().positive(),
  depositAmount: z.number().nonnegative(),
  paymentPlanType: z.enum(["Comptant", "Échéancier"]),
  durationMonths: z.number().int().min(1).max(120).optional(),
  agencyId: z.string().uuid().optional(),
});

export const createSaleDraft = createServerFn({ method: "POST" })
  .inputValidator((data) => createSaleSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client.server");
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Unauthorized");

    // Start a transaction-like process
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        client_id: data.clientId,
        plot_id: data.plotId,
        total_amount: data.totalAmount,
        deposit_amount: data.depositAmount,
        payment_plan_type: data.paymentPlanType,
        agency_id: data.agencyId,
        created_by: user.id,
        status: "Brouillon",
      })
      .select()
      .single();

    if (saleError) throw saleError;

    if (data.paymentPlanType === "Échéancier" && data.durationMonths) {
      const remainingAmount = data.totalAmount - data.depositAmount;
      const monthlyAmount = Math.round((remainingAmount / data.durationMonths) * 100) / 100;
      
      const schedules = [];
      for (let i = 1; i <= data.durationMonths; i++) {
        schedules.push({
          sale_id: sale.id,
          due_date: format(addMonths(new Date(), i), "yyyy-MM-dd"),
          amount_due: monthlyAmount,
          status: "En attente",
        });
      }

      const { error: scheduleError } = await supabase
        .from("payment_schedules")
        .insert(schedules);

      if (scheduleError) throw scheduleError;
    }

    return sale;
  });

export const validateSale = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ saleId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client.server");
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Unauthorized");

    // Check if user has PDG role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "pdg")
      .single();

    if (!roleData) throw new Error("Seul le PDG peut valider une vente.");

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .update({
        status: "Validée",
        validated_by_id: user.id,
        validation_date: new Date().toISOString(),
      })
      .eq("id", data.saleId)
      .select()
      .single();

    if (saleError) throw saleError;

    return sale;
  });

export const getSaleDetails = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ saleId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client.server");
    
    const { data: sale, error } = await supabase
      .from("sales")
      .select(`
        *,
        client:clients(*),
        plot:plots(*),
        payment_schedules(*)
      `)
      .eq("id", data.saleId)
      .single();

    if (error) throw error;
    return sale;
  });
