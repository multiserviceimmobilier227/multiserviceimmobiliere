import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Phase 12.1 : Récupération des catégories de dépenses
 */
export const getExpenseCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context!;
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .order("name");

    if (error) throw new Error(error.message);
    return data || [];
  });

/**
 * Phase 12.2 : Récupération de l'état de la caisse pour l'agence de l'utilisateur
 */
export const getActiveCashJournal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context!;
    
    // 1. Get user's agency
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("agence_id")
      .eq("user_id", userId)
      .single();
    
    if (!userRole?.agence_id) return null;

    // 2. Find active session (status = 'ouvert')
    const { data, error } = await supabase
      .from("cash_journals")
      .select(`
        *
      `)
      .eq("agency_id", userRole.agence_id)
      .eq("status", "ouvert")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  });

/**
 * Phase 12.2 : Ouverture de caisse
 */
export const openCashSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    openingBalance: z.number().nonnegative(),
    agencyId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // Check if a session is already open
    const { data: active } = await supabase
      .from("cash_journals")
      .select("id")
      .eq("agency_id", data.agencyId)
      .eq("status", "ouvert")
      .maybeSingle();

    if (active) throw new Error("Une session de caisse est déjà ouverte pour cette agence.");

    const { data: journal, error } = await supabase
      .from("cash_journals")
      .insert({
        agency_id: data.agencyId,
        opened_by_id: userId,
        opening_balance: data.openingBalance,
        theoretical_closing_balance: data.openingBalance,
        status: "ouvert"
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return journal;
  });

/**
 * Phase 12.3 : Soumission d'une dépense
 */
export const submitExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    amount: z.number().positive(),
    categoryId: z.string().uuid(),
    description: z.string().min(3),
    beneficiary: z.string().optional(),
    paymentMethod: z.enum(['espece', 'nita', 'virement', 'cheque', 'mobile_money']),
    agencyId: z.string().uuid(),
    projectId: z.string().uuid().optional(),
    receiptUrl: z.string().url().optional().nullable(),
    cashJournalId: z.string().uuid().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        amount: data.amount,
        category_id: data.categoryId,
        description: data.description,
        beneficiary: data.beneficiary || null,
        payment_method: data.paymentMethod,
        agency_id: data.agencyId,
        project_id: data.projectId || null,
        receipt_url: data.receiptUrl || null,
        cash_journal_id: data.cashJournalId || null,
        created_by_id: userId,
        status: 'en_attente_validation'
      })
      .select()
      .single();

    // Phase 12.4 : Notification PDG gérée par trigger (SQL fn_tr_notify_pdg_large_expense)
    // Nous n'avons pas besoin d'insertion manuelle ici pour éviter les erreurs de type et les duplications.
    
    return expense;
  });

/**
 * Phase 12.4 : Validation d'une dépense (PDG uniquement)
 */
export const validateExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    expenseId: z.string().uuid(),
    approve: z.boolean()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // PDG Role check
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "pdg")
      .single();

    if (!role) throw new Error("Seul le PDG peut valider une dépense.");

    const { data: expense, error } = await supabase
      .from("expenses")
      .update({
        status: data.approve ? 'validé' : 'rejeté',
        validated_by_id: userId,
        validation_date: new Date().toISOString()
      })
      .eq("id", data.expenseId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return expense;
  });

/**
 * Phase 12.5 : Clôture de caisse
 */
export const closeCashSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    journalId: z.string().uuid(),
    closingBalance: z.number().nonnegative(),
    notes: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // Get journal details to calculate discrepancy
    const { data: journal } = await supabase
      .from("cash_journals")
      .select("theoretical_closing_balance")
      .eq("id", data.journalId)
      .single();

    if (!journal) throw new Error("Journal non trouvé.");

    const discrepancy = data.closingBalance - journal.theoretical_closing_balance;

    const { data: closedJournal, error } = await supabase
      .from("cash_journals")
      .update({
        actual_closing_balance: data.closingBalance,
        discrepancy: discrepancy,
        closed_by_id: userId,
        closed_at: new Date().toISOString(),
        status: "fermé",
        discrepancy_reason: data.notes || null
      })
      .eq("id", data.journalId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return closedJournal;
  });

/**
 * Phase 12.6 : Récupération des flux financiers consolidés
 */
export const getFinancialFlows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context!;
    
    // Combined view of inflows and outflows
    const { data, error } = await supabase
      .from("daily_cash_operations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  });

/**
 * Phase 12.7 : Correction de dépense (Annule et Remplace)
 */
export const correctExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    expenseId: z.string().uuid(),
    reason: z.string().min(5),
    newData: z.object({
      amount: z.number().positive(),
      description: z.string(),
      beneficiary: z.string()
    })
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // 1. Get old data for audit
    const { data: oldExpense } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", data.expenseId)
      .single();

    if (!oldExpense) throw new Error("Dépense non trouvée.");
    
    // Check if linked to closed journal
    if (oldExpense.cash_journal_id) {
       const { data: journal } = await supabase
         .from("cash_journals")
         .select("status")
         .eq("id", oldExpense.cash_journal_id)
         .single();
       if (journal?.status === 'fermé') throw new Error("Impossible de corriger une dépense sur une caisse clôturée.");
    }

    // 2. Insert into audit log
    await supabase.from("audit_finance_corrections").insert({
      record_id: data.expenseId,
      record_type: 'expense',
      old_data: oldExpense as any,
      new_data: data.newData as any,
      reason: data.reason,
      corrected_by: userId
    });

    // 3. Update expense
    const { data: updated, error } = await supabase
      .from("expenses")
      .update({
        amount: data.newData.amount,
        description: data.newData.description,
        beneficiary: data.newData.beneficiary,
        status: 'en_attente_validation' 
      })
      .eq("id", data.expenseId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });
