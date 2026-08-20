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
   durationMonths: z.number().int().min(0).max(120).optional(),
   agencyId: z.string().uuid().optional(),
   firstPaymentDate: z.string().optional(),
   justification: z.string().optional(),
   customSchedules: z.array(z.object({
     due_date: z.string(),
     amount_due: z.number().positive(),
     notes: z.string().optional()
   })).optional()
 });

export const createSaleDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createSaleSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Verify client exists
    const { data: clientCheck, error: clientCheckError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", data.clientId)
      .single();

    if (clientCheckError || !clientCheck) {
      throw new Error("Client invalide ou inexistant.");
    }

    // 2. Pre-check plot availability to avoid trigger error message
    const { data: activeSale } = await supabase
      .from("sales")
      .select("id")
      .eq("plot_id", data.plotId)
      .in("status", ["reservation", "en_cours", "termine"])
      .maybeSingle();

    if (activeSale) {
      throw new Error("Cette parcelle est déjà réservée ou vendue.");
    }

    const { data: plotCheck } = await supabase
      .from("plots")
      .select("status")
      .eq("id", data.plotId)
      .single();

    if (plotCheck?.status !== "Disponible") {
      throw new Error("La parcelle sélectionnée n'est plus disponible.");
    }


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
         first_payment_date: data.firstPaymentDate || null,
         notes: data.justification || null
       })

      .select()
      .single();

    if (saleError) throw new Error(saleError.message);

    if (data.paymentPlanType === "Échéancier") {
      const schedules = [];
      const baseDate = data.firstPaymentDate ? new Date(data.firstPaymentDate) : new Date();

      if (data.customSchedules && data.customSchedules.length > 0) {
        // Use custom schedules if provided
        for (const item of data.customSchedules) {
          schedules.push({
            sale_id: sale.id,
            due_date: item.due_date,
            amount_due: item.amount_due,
            status: "En attente",
            schedule_type: "manuel",
            notes: item.notes || null
          });
        }
      } else if (data.durationMonths) {
        // Default equal installments
        const remainingAmount = data.totalAmount - data.depositAmount;
        const monthlyAmount = Math.round((remainingAmount / data.durationMonths) * 100) / 100;
        
        for (let i = 1; i <= data.durationMonths; i++) {
          schedules.push({
            sale_id: sale.id,
            due_date: format(addMonths(baseDate, i), "yyyy-MM-dd"),
            amount_due: monthlyAmount,
            status: "En attente",
            schedule_type: "automatique"
          });
        }
      }

      if (schedules.length > 0) {
        const { error: scheduleError } = await supabase
          .from("payment_schedules")
          .insert(schedules);

        if (scheduleError) throw new Error(scheduleError.message);
      }
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
        payments(*),
        refunds(*),
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
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "pdg")
      .single();

    if (roleError || !roleData) throw new Error("Seul le PDG peut ajuster le prix d'une vente.");

    // Get current sale to calculate new balance
    const { data: sale } = await supabase
      .from("sales")
      .select("deposit_amount, total_amount, balance")
      .eq("id", data.saleId)
      .single();
    
    if (!sale) throw new Error("Vente non trouvée");

    const newBalance = data.newTotalAmount - (sale.deposit_amount || 0);

    // 1. Update the sale
    const { error: updateError } = await supabase
      .from("sales")
      .update({
        total_amount: data.newTotalAmount,
        total_price: data.newTotalAmount,
        final_price: data.newTotalAmount,
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq("id", data.saleId);

    if (updateError) throw new Error(updateError.message);

    // 2. MSI 2.0 Phase 10: Recalculate unpaid schedules
    // Find unpaid schedules
    const { data: unpaidSchedules } = await supabase
      .from("payment_schedules")
      .select("*")
      .eq("sale_id", data.saleId)
      .neq("status", "Payé")
      .order("due_date", { ascending: true });

    if (unpaidSchedules && unpaidSchedules.length > 0) {
      // Calculate how much is already paid across all schedules
      const { data: allSchedules } = await supabase
        .from("payment_schedules")
        .select("amount_paid")
        .eq("sale_id", data.saleId);
      
      const totalAlreadyPaid = allSchedules?.reduce((acc, curr) => acc + (Number(curr.amount_paid) || 0), 0) || 0;
      const remainingToSchedule = data.newTotalAmount - (sale.deposit_amount || 0) - totalAlreadyPaid;
      
      if (remainingToSchedule > 0) {
        const monthlyAmount = Math.round(remainingToSchedule / unpaidSchedules.length);
        let distributed = 0;
        
        for (let i = 0; i < unpaidSchedules.length; i++) {
          const schedule = unpaidSchedules[i];
          if (!schedule) continue;
          
          const isLast = i === unpaidSchedules.length - 1;
          const currentPaid = Number(schedule.amount_paid) || 0;
          const newAmountDue = isLast ? (remainingToSchedule - distributed) + currentPaid : monthlyAmount + currentPaid;
          
          await supabase
            .from("payment_schedules")
            .update({ 
              amount_due: newAmountDue,
              status: currentPaid >= newAmountDue ? "Payé" : (currentPaid > 0 ? "Partiel" : "En attente")
            })
            .eq("id", schedule.id);
          
          distributed += monthlyAmount;
        }
      }
    }

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
    method: z.enum(["espece", "virement", "cheque", "mobile_money"]),
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

    // Phase A-02 : la journalisation d'audit est assurée par le trigger
    // tr_audit_payment_creation (source unique de vérité, pas de doublon).


    // 2. Update payment schedules (Phase 10 logic)
    // Find oldest unpaid schedules and apply the amount to them
    const { data: schedules } = await supabase
      .from("payment_schedules")
      .select("*")
      .eq("sale_id", data.saleId)
      .neq("status", "Payé")
      .order("due_date", { ascending: true });

    if (schedules && schedules.length > 0) {
      let remainingPayment = data.amount;
      for (const schedule of schedules) {
        if (remainingPayment <= 0) break;
        
        const currentPaid = schedule.amount_paid || 0;
        const currentDue = schedule.amount_due;
        const needed = currentDue - currentPaid;
        
        const apply = Math.min(remainingPayment, needed);
        const newPaid = currentPaid + apply;
        remainingPayment -= apply;
        
        await supabase
          .from("payment_schedules")
          .update({ 
            amount_paid: newPaid,
            status: newPaid >= currentDue ? "Payé" : "Partiel"
          })
          .eq("id", schedule.id);
      }
    }

    // 3. Update sale balance
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


// ============= Phase A-02 : Annulation et remboursement =============

const FINANCE_ROLES = ["pdg", "admin", "super_admin", "comptable"] as const;

export const cancelSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    saleId: z.string().uuid(),
    reason: z.string().min(3),
    refundAmount: z.number().nonnegative().optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const allowed = (roles ?? []).some((r) => (FINANCE_ROLES as readonly string[]).includes(r.role));
    if (!allowed) throw new Error("Seuls le PDG, l'administrateur ou le comptable peuvent annuler une vente.");

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("id, status, total_amount, total_price, deposit_amount, payments(amount), refunds(amount)")
      .eq("id", data.saleId)
      .single();

    if (saleError || !sale) throw new Error("Vente introuvable.");
    if (sale.status === "annule") throw new Error("Cette vente est déjà annulée.");

    const collected =
      Number(sale.deposit_amount ?? 0) +
      (sale.payments ?? []).reduce((acc: number, p: any) => acc + Number(p.amount ?? 0), 0);
    const alreadyRefunded = (sale.refunds ?? []).reduce((acc: number, r: any) => acc + Number(r.amount ?? 0), 0);
    const refundable = Math.max(0, collected - alreadyRefunded);
    const refundAmount = data.refundAmount ?? 0;

    if (refundAmount > refundable) {
      throw new Error(
        `Le remboursement demandé dépasse les sommes réellement encaissées (max : ${refundable} FCFA).`
      );
    }

    // 1. Remboursement éventuel (journalisé automatiquement par trigger)
    if (refundAmount > 0) {
      const { error: refundError } = await supabase.from("refunds").insert({
        sale_id: data.saleId,
        amount: refundAmount,
        reason: data.reason,
        processed_by: userId,
      });
      if (refundError) throw new Error(`Remboursement impossible : ${refundError.message}`);
    }

    // 2. Annulation de la vente : le trigger libère la parcelle,
    // annule les échéances non payées et journalise la trace négative du CA.
    const { error: updateError } = await supabase
      .from("sales")
      .update({
        status: "annule",
        balance: 0,
        notes: data.reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.saleId);

    if (updateError) throw new Error(updateError.message);

    return { success: true, refunded: refundAmount, refundable };
  });

export const getSaleFinancialLedger = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ saleId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: ledger, error } = await context.supabase
      .from("audit_finance")
      .select("*")
      .eq("sale_id", data.saleId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return ledger ?? [];
  });






