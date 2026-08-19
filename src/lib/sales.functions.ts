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
        total_price: data.totalAmount,
        balance: data.totalAmount - data.depositAmount,
        deposit_amount: data.depositAmount,
        agency_id: data.agencyId ?? null,
        prepared_by_id: userId,
        status: "reservation",
        sale_date: format(new Date(), "yyyy-MM-dd"),
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

    // 1. Update the sale status
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .update({
        status: "en_cours", // Map to sale_status enum
        validated_by_id: userId,
        validation_date: new Date().toISOString(),
      })
      .eq("id", data.saleId)
      .select(`
        *,
        client:clients(*),
        plot:plots(*)
      `)
      .single();

    if (saleError) throw new Error(saleError.message);

    // 2. Create historical snapshot
    const { error: snapshotError } = await supabase
      .from("contract_snapshots")
      .insert({
        sale_id: data.saleId,
        client_data: sale.client as any,
        plot_data: sale.plot as any,
        sale_data: {
          total_amount: sale.total_amount,
          deposit_amount: sale.deposit_amount,
          payment_plan_type: (sale as any).payment_plan_type,
          sale_date: sale.sale_date
        } as any,
        created_by: userId
      });

    if (snapshotError) {
      console.error("Snapshot error:", snapshotError);
      // We don't block the validation if snapshot fails, but in production we should
    }

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
        plot:plots(
          *,
          ilot:ilots(
            *,
            zone:zones(
              *,
              lotissement:lotissements(*)
            )
          )
        ),
        payment_schedules(*),
        snapshots:contract_snapshots(*),
        mutations:sale_mutations(*)
      `)
      .eq("id", data.saleId)
      .single();

    if (error) throw new Error(error.message);
    return sale;
  });

export const adjustSalePrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ 
    saleId: z.string().uuid(), 
    newTotalAmount: z.number().positive(),
    reason: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check PDG role
    const { data: isPdg } = await supabase.rpc('has_role', { 
      _user_id: userId, 
      _role: 'pdg' 
    });

    if (!isPdg) throw new Error("Seul le PDG peut ajuster le prix d'une vente.");

    // Get current sale to calculate new balance
    const { data: sale } = await supabase
      .from("sales")
      .select("deposit_amount, total_amount")
      .eq("id", data.saleId)
      .single();

    if (!sale) throw new Error("Vente non trouvée");

    // We assume the total_price/total_amount logic
    const { error: updateError } = await supabase
      .from("sales")
      .update({
        total_amount: data.newTotalAmount,
        total_price: data.newTotalAmount,
        balance: data.newTotalAmount - (sale.deposit_amount || 0),
        updated_at: new Date().toISOString()
      })
      .eq("id", data.saleId);

    if (updateError) throw new Error(updateError.message);

    return { success: true };
  });

export const createMutationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    saleId: z.string().uuid(),
    oldPlotId: z.string().uuid(),
    newPlotId: z.string().uuid(),
    reason: z.string(),
    priceDifference: z.number()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: mutation, error } = await supabase
      .from("sale_mutations")
      .insert({
        sale_id: data.saleId,
        old_plot_id: data.oldPlotId,
        new_plot_id: data.newPlotId,
        reason: data.reason,
        price_difference: data.priceDifference,
        requested_by: userId,
        status: 'En attente'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mutation;
  });

export const registerPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    saleId: z.string().uuid(),
    amount: z.number().positive(),
    paymentDate: z.string(),
    method: z.string(),
    reference: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // 1. Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        sale_id: data.saleId,
        amount: data.amount,
        payment_date: data.paymentDate,
        method: data.method,
        reference: data.reference ?? null,
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (paymentError) throw new Error(paymentError.message);

    // 2. Update sale balance
    const { data: sale } = await supabase
      .from("sales")
      .select("balance")
      .eq("id", data.saleId)
      .single();

    if (sale) {
      const newBalance = Math.max(0, Number(sale.balance) - data.amount);
      await supabase
        .from("sales")
        .update({ balance: newBalance })
        .eq("id", data.saleId);
    }

    return payment;
  });




