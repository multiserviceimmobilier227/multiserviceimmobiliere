import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { addMonths, format } from "date-fns";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createSaleSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

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
        created_by: userId,
        status: "Brouillon",
      })
      .select()
      .single();

    if (saleError) throw new Error(saleError.message);

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

      if (scheduleError) throw new Error(scheduleError.message);
    }

    return sale;
  });

export const validateSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ saleId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check if user has PDG role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "pdg")
      .single();

    if (roleError || !roleData) throw new Error("Seul le PDG peut valider une vente.");

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .update({
        status: "Validée",
        validated_by_id: userId,
        validation_date: new Date().toISOString(),
      })
      .eq("id", data.saleId)
      .select()
      .single();

    if (saleError) throw new Error(saleError.message);

    return sale;
  });

export const getSaleDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ saleId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    
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

    if (error) throw new Error(error.message);
    return sale;
  });

