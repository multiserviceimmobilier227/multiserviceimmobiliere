import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
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
    const { supabase, userId } = context!;

    // 1. Verify client exists
    const { data: clientCheck, error: clientCheckError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", data.clientId)
      .single();

    if (clientCheckError || !clientCheck) {
      await supabase.from("audit_logs").insert({
        user_id: userId,
        action: "INTEGRITY_ALERT",
        table_name: "sales",
        new_data: { error: "Tentative de vente à un client inexistant", clientId: data.clientId }
      });
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
      await supabase.from("audit_logs").insert({
        user_id: userId,
        action: "CRITICAL_INTEGRITY_VIOLATION",
        table_name: "sales",
        record_id: data.plotId,
        new_data: { error: "Tentative de double vente détectée", plotId: data.plotId }
      });
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
    const { supabase, userId } = context!;

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
    const { supabase } = context!;
    
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
        mutations:sale_mutations(*),
        arrears_details:v_sale_arrears(is_critical_delay, total_arrears)
      `)

      .eq("id", data.saleId)
      .single();

    if (error) throw new Error(error.message);
    return sale;
  });

export const getImputationPreview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ 
    saleId: z.string().uuid(), 
    amount: z.number().positive() 
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: preview, error } = await context.supabase.rpc(
      'fn_get_payment_imputation_preview',
      {
        p_sale_id: data.saleId,
        p_amount: data.amount
      }
    );

    if (error) throw new Error(error.message);
    return preview;
  });


export const adjustSalePrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ 
    saleId: z.string().uuid(), 
    newTotalAmount: z.number().positive(),
    reason: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

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
      
      const totalAlreadyPaid = allSchedules?.reduce((acc: number, curr: any) => acc + (Number(curr.amount_paid) || 0), 0) || 0;
      
      // The remaining to schedule is: New Total - Deposit - Total Paid in schedules
      const remainingToSchedule = data.newTotalAmount - (sale.deposit_amount || 0) - totalAlreadyPaid;
      
      if (remainingToSchedule >= 0) {
        const monthlyAmount = Math.floor(remainingToSchedule / unpaidSchedules.length);
        let distributed = 0;
        
        for (let i = 0; i < unpaidSchedules.length; i++) {
          const schedule = unpaidSchedules[i];
          if (!schedule) continue;
          
          const isLast = i === unpaidSchedules.length - 1;
          const currentPaid = Number(schedule.amount_paid) || 0;
          
          // New amount_due for this schedule
          const portion = isLast ? (remainingToSchedule - distributed) : monthlyAmount;
          const newAmountDue = portion + currentPaid;
          
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
    const { supabase, userId } = context!;

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
    const { supabase, userId } = context!;

    // Phase 11.1: Permissions & Roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    const financeRoles = ["pdg", "comptable", "admin", "super_admin"];
    const userRoles = roles?.map((r: any) => r.role) || [];
    const canRegister = userRoles.some((r: any) => financeRoles.includes(r as string));
    
    if (!canRegister) {
      throw new Error("Droit d'encaissement insuffisant.");
    }

    const isPdgOrAdmin = userRoles.some((r: any) => ["pdg", "admin", "super_admin"].includes(r as string));

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
        // Phase 11.1: Confirmation logic
        confirmed_at: isPdgOrAdmin ? new Date().toISOString() : null,
        confirmed_by: isPdgOrAdmin ? userId : null
      })
      .select()
      .single();

    if (paymentError) throw new Error(paymentError.message);

    // 2. Call the new imputation engine
    const { data: imputedData, error: imputationError } = await supabase.rpc(
      'fn_impute_payment_on_schedule',
      {
        p_payment_id: payment.id,
        p_sale_id: data.saleId,
        p_amount: data.amount
      }
    );

    if (imputationError) {
      console.error("Imputation error:", imputationError);
    } else {
      // Update payment with imputation details
      await supabase
        .from("payments")
        .update({ imputed_data: imputedData })
        .eq("id", payment.id);
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

    return { ...payment, imputed_data: imputedData };
  });

export const getCommercialPerformance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    agenceId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  }).optional().parse(data))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    let query = supabaseAdmin
      .from("v_commercial_performance_detailed")
      .select("*");
    
    if (input?.agenceId && input.agenceId !== "all") {
      query = query.eq("agency_id", input.agenceId);
    }

    if (input?.startDate) {
      query = query.gte("sale_date", input.startDate);
    }

    if (input?.endDate) {
      query = query.lte("sale_date", input.endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);

    // Aggregate results by agent since the view is grouped by date too
    const aggregated: Record<string, any> = {};
    data.forEach(row => {
      if (!aggregated[row.agent_id]) {
        aggregated[row.agent_id] = { ...row, total_sales: 0, total_value: 0, collected_amount: 0, total_balance: 0 };
      }
      aggregated[row.agent_id].total_sales += Number(row.total_sales);
      aggregated[row.agent_id].total_value += Number(row.total_value);
      aggregated[row.agent_id].collected_amount += Number(row.collected_amount);
      aggregated[row.agent_id].total_balance += Number(row.total_balance);
    });

    return Object.values(aggregated).sort((a, b) => b.total_sales - a.total_sales);
  });

export const getCashFlowProjections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data, error } = await supabaseAdmin
      .from("payment_schedules")
      .select("due_date, amount_due")
      .neq("status", "Payé")
      .gte("due_date", new Date().toISOString().split('T')[0])
      .order("due_date", { ascending: true });
    
    if (error) throw new Error(error.message);
    
    const projections: Record<string, number> = {};
    data.forEach(item => {
      const month = item.due_date.substring(0, 7);
      projections[month] = (projections[month] || 0) + Number(item.amount_due);
    });
    
    return Object.entries(projections)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(0, 12);
  });



export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ paymentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // Role check: Only PDG or Admin can confirm
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    const isPdgOrAdmin = roles?.some((r: any) => ["pdg", "admin", "super_admin"].includes(r.role as string));
    if (!isPdgOrAdmin) throw new Error("Seul le PDG peut confirmer un encaissement.");

    const { error } = await supabase
      .from("payments")
      .update({
        confirmed_at: new Date().toISOString(),
        confirmed_by: userId
      })
      .eq("id", data.paymentId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const correctPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    paymentId: z.string().uuid(),
    newAmount: z.number().positive(),
    reason: z.string().min(5)
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // Role check
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    const isPdgOrAdmin = roles?.some((r: any) => ["pdg", "admin", "super_admin"].includes(r.role as string));
    if (!isPdgOrAdmin) throw new Error("Seul le PDG peut corriger un montant déjà encaissé.");

    // 1. Get old payment data
    const { data: oldPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("id", data.paymentId)
      .single();

    if (!oldPayment) throw new Error("Paiement non trouvé.");

    // 2. Record the correction (Audit Ledger)
    const { error: correctionError } = await supabase
      .from("payment_corrections")
      .insert({
        payment_id: data.paymentId,
        old_amount: oldPayment.amount,
        new_amount: data.newAmount,
        old_data: oldPayment as any,
        reason: data.reason,
        corrected_by: userId
      });

    if (correctionError) throw new Error(correctionError.message);

    // 3. Reverse previous imputation and balance
    // This is complex. In MSI 2.0, we prefer "Annule et Remplace" logic.
    // For simplicity here, we update and re-run imputation.
    
    // a. Reset schedules affected by this payment
    if (oldPayment.imputed_data && Array.isArray(oldPayment.imputed_data)) {
      for (const item of (oldPayment.imputed_data as any[])) {
        if (!item?.schedule_id) continue;
        
        const { data: schedule } = await supabase
          .from("payment_schedules")
          .select("amount_paid, amount_due")
          .eq("id", item.schedule_id)
          .single();
        
        if (schedule) {
          const newPaid = Math.max(0, Number(schedule.amount_paid) - Number(item.amount_applied || 0));
          await supabase
            .from("payment_schedules")
            .update({
              amount_paid: newPaid,
              status: newPaid >= schedule.amount_due ? "Payé" : (newPaid > 0 ? "Partiel" : "En attente")
            })
            .eq("id", item.schedule_id);
        }
      }
    }

    // b. Update sale balance (add old amount back)
    const { data: sale } = await supabase
      .from("sales")
      .select("balance")
      .eq("id", oldPayment.sale_id)
      .single();

    if (sale) {
      await supabase
        .from("sales")
        .update({ balance: Number(sale.balance) + Number(oldPayment.amount) - data.newAmount })
        .eq("id", oldPayment.sale_id);
    }

    // c. Update payment amount and re-impute
    const { error: updateError } = await supabase
      .from("payments")
      .update({ 
        amount: data.newAmount, 
        notes: `Corrigé: ${data.reason}`,
        confirmed_at: new Date().toISOString(),
        confirmed_by: userId
      })

      .eq("id", data.paymentId);

    if (updateError) throw new Error(updateError.message);

    const { data: newImputedData } = await supabase.rpc(
      'fn_impute_payment_on_schedule',
      {
        p_payment_id: data.paymentId,
        p_sale_id: oldPayment.sale_id,
        p_amount: data.newAmount
      }
    );

    await supabase
      .from("payments")
      .update({ imputed_data: newImputedData })
      .eq("id", data.paymentId);

    return { success: true };
  });





// ============= Phase A-02 : Annulation et remboursement =============

export const cancelSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    saleId: z.string().uuid(),
    reason: z.string().min(3),
    refundAmount: z.number().nonnegative().optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const financeRoles = ["pdg", "admin", "super_admin", "comptable"];
    const allowed = (roles ?? []).some((r: any) => financeRoles.includes(r.role));
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
  .inputValidator((data) => z.object({ saleId: z.string().uuid().optional() }).parse(data))
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("audit_finance")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.saleId) {
      query = query.eq("sale_id", data.saleId);
    } else {
      query = query.limit(50);
    }

    const { data: ledger, error } = await query;

    if (error) throw new Error(error.message);
    return ledger ?? [];
  });

export const getNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context!;
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ notificationId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    if (!userId) throw new Error("Non authentifié");
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true } as any)
      .eq('id', data.notificationId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getArrearsList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context!;
    
    // Auto-check and trigger notifications before returning the list
    try {
      await supabase.rpc('fn_check_and_notify_arrears');
    } catch (e) {
      console.error("Erreur lors de la vérification des notifications d'arriérés:", e);
    }
    
    const { data, error } = await (supabase as any)
      .from('v_sale_arrears')
      .select('*')
      .order('days_overdue', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getSaleArrearsDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ saleId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context!;
    
    const { data: arrears, error } = await (supabase as any)
      .rpc('fn_calculate_sale_arrears', { _sale_id: data.saleId })
      .maybeSingle();

    if (error) throw new Error(error.message);
    return arrears;
  });





