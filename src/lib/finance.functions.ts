import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Phase 12.1 : Récupération des catégories de dépenses
 */
export const getExpenseCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
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
    const { supabase, userId } = context;
    
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
    const { supabase, userId } = context;

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
    const { supabase, userId } = context;

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
    approve: z.boolean()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

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
