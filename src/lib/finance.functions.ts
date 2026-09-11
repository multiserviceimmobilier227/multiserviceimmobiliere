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
/**
 * Résout l'agence de rattachement de l'utilisateur.
 * Un utilisateur peut porter plusieurs rôles : on retient le premier rôle rattaché
 * à une agence, et à défaut (super admin) le siège de Maradi.
 */
async function resolveUserAgency(
  supabase: any,
  userId: string,
): Promise<string | null> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("agence_id, created_at")
    .eq("user_id", userId)
    .not("agence_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(1);

  const agencyId = roles?.[0]?.agence_id as string | undefined;
  if (agencyId) return agencyId;

  const { data: fallback } = await supabase
    .from("agences")
    .select("id")
    .eq("code", "MAR")
    .maybeSingle();

  return (fallback?.id as string | undefined) ?? null;
}

export const getActiveCashJournal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context!;
    if (!userId) return null;

    const agencyId = await resolveUserAgency(supabase, userId);
    if (!agencyId) return null;

    const { data, error } = await supabase
      .from("cash_journals")
      .select("*, agences(name, city, code)")
      .eq("agency_id", agencyId)
      .eq("status", "ouvert")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  });

/**
 * Agence de rattachement courante (utilisée par l'écran de caisse).
 */
export const getMyAgency = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context!;
    if (!userId) return null;
    const agencyId = await resolveUserAgency(supabase, userId);
    if (!agencyId) return null;
    const { data } = await supabase
      .from("agences")
      .select("id, name, city, code")
      .eq("id", agencyId)
      .maybeSingle();
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
    projectId: z.string().uuid().optional().nullable(),
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

    if (error) throw new Error(error.message);
    return expense;
  });

/**
 * Phase 12.4 : Validation d'une dépense (PDG uniquement)
 */
export const validateExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    expenseId: z.string().uuid(),
    approve: z.boolean(),
    notes: z.string().optional()
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
        validation_date: new Date().toISOString(),
        validation_notes: data.notes || null
      })
      .eq("id", data.expenseId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return expense;
  });

/**
 * Phase 12.5 : Clôture de caisse avec gestion des écarts
 */
export const closeCashSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    journalId: z.string().uuid(),
    closingBalance: z.number().nonnegative(),
    notes: z.string().optional(),
    adjustmentReason: z.string().optional()
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

    // Si un écart est constaté et une raison fournie, on journalise
    if (discrepancy !== 0 && data.adjustmentReason) {
      await supabase.from("daily_cash_adjustments").insert({
        journal_id: data.journalId,
        amount: discrepancy,
        reason: data.adjustmentReason,
        adjusted_by: userId
      });
    }

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