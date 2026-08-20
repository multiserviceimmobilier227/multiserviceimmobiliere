
-- 1. Function to calculate theoretical cash balance
CREATE OR REPLACE FUNCTION public.fn_calculate_theoretical_cash(_agency_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_opening_balance numeric;
    v_total_inflows numeric;
    v_total_outflows numeric;
    v_active_journal_id uuid;
BEGIN
    -- Get the current active journal
    SELECT id, opening_balance INTO v_active_journal_id, v_opening_balance
    FROM public.cash_journals
    WHERE agency_id = _agency_id AND status = 'ouvert'
    LIMIT 1;

    IF v_active_journal_id IS NULL THEN
        RETURN 0;
    END IF;

    -- Sum inflows from daily_cash_operations (Phase 11) for this agency and since opened_at
    SELECT COALESCE(SUM(amount), 0) INTO v_total_inflows
    FROM public.daily_cash_operations
    WHERE agency_id = _agency_id 
      AND operation_type = 'ENTREE'
      AND created_at >= (SELECT opened_at FROM public.cash_journals WHERE id = v_active_journal_id);

    -- Sum outflows from validated expenses for this agency and this journal
    SELECT COALESCE(SUM(amount), 0) INTO v_total_outflows
    FROM public.expenses
    WHERE agency_id = _agency_id 
      AND status = 'validé'
      AND (cash_journal_id = v_active_journal_id OR (created_at >= (SELECT opened_at FROM public.cash_journals WHERE id = v_active_journal_id)));

    RETURN v_opening_balance + v_total_inflows - v_total_outflows;
END;
$$;

-- 2. Trigger to prevent expense deletion (Soft-delete only via status)
CREATE OR REPLACE FUNCTION public.fn_prevent_expense_deletion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'La suppression de dépense est interdite. Utilisez l''annulation historisée.';
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_expense_deletion ON public.expenses;
CREATE TRIGGER tr_prevent_expense_deletion
BEFORE DELETE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_expense_deletion();

-- 3. Trigger to lock closed cash day
CREATE OR REPLACE FUNCTION public.fn_lock_closed_cash_day()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_journal_status text;
BEGIN
    -- Check if the expense is linked to a closed journal
    IF NEW.cash_journal_id IS NOT NULL THEN
        SELECT status INTO v_journal_status FROM public.cash_journals WHERE id = NEW.cash_journal_id;
        IF v_journal_status = 'fermé' THEN
            RAISE EXCEPTION 'Impossible de modifier une transaction sur une caisse clôturée.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_lock_closed_cash_day ON public.expenses;
CREATE TRIGGER tr_lock_closed_cash_day
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_lock_closed_cash_day();

-- 4. Trigger to notify PDG on large expense (> 100,000 FCFA)
CREATE OR REPLACE FUNCTION public.fn_notify_pdg_on_large_expense()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.amount > 100000 AND NEW.status = 'en_attente_validation' THEN
        INSERT INTO public.notifications (user_id, title, message, type, related_id)
        SELECT user_id, 'Dépense Importante', 'Une dépense de ' || NEW.amount || ' FCFA attend votre validation.', 'finance', NEW.id
        FROM public.user_roles
        WHERE role = 'pdg';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_pdg_on_large_expense ON public.expenses;
CREATE TRIGGER tr_notify_pdg_on_large_expense
AFTER INSERT OR UPDATE OF status ON public.expenses
FOR EACH ROW WHEN (NEW.status = 'en_attente_validation')
EXECUTE FUNCTION public.fn_notify_pdg_on_large_expense();

-- 5. Trigger to notify PDG on cash discrepancy (> 5000 FCFA)
CREATE OR REPLACE FUNCTION public.fn_notify_pdg_on_cash_discrepancy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF ABS(NEW.discrepancy) > 5000 THEN
        INSERT INTO public.notifications (user_id, title, message, type, related_id)
        SELECT user_id, 'Écart de Caisse Significatif', 'Un écart de ' || NEW.discrepancy || ' FCFA a été détecté lors de la clôture.', 'finance', NEW.id
        FROM public.user_roles
        WHERE role = 'pdg';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_pdg_on_cash_discrepancy ON public.cash_journals;
CREATE TRIGGER tr_notify_pdg_on_cash_discrepancy
AFTER UPDATE OF status ON public.cash_journals
FOR EACH ROW WHEN (NEW.status = 'fermé')
EXECUTE FUNCTION public.fn_notify_pdg_on_cash_discrepancy();

-- 6. Update theoretical balance on cash journals when expenses are validated
CREATE OR REPLACE FUNCTION public.fn_sync_cash_journal_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status != 'validé' AND NEW.status = 'validé') OR (TG_OP = 'INSERT' AND NEW.status = 'validé') THEN
        IF NEW.cash_journal_id IS NOT NULL THEN
            UPDATE public.cash_journals
            SET theoretical_closing_balance = theoretical_closing_balance - NEW.amount
            WHERE id = NEW.cash_journal_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_cash_journal_balance ON public.expenses;
CREATE TRIGGER tr_sync_cash_journal_balance
AFTER INSERT OR UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_cash_journal_balance();

-- 7. Sync from daily_cash_operations (Inflows) to cash journals
CREATE OR REPLACE FUNCTION public.fn_sync_cash_inflows()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_active_journal_id uuid;
BEGIN
    IF NEW.operation_type = 'ENTREE' THEN
        -- Find active journal for the agency
        SELECT id INTO v_active_journal_id
        FROM public.cash_journals
        WHERE agency_id = NEW.agency_id AND status = 'ouvert'
        LIMIT 1;

        IF v_active_journal_id IS NOT NULL THEN
            UPDATE public.cash_journals
            SET theoretical_closing_balance = theoretical_closing_balance + NEW.amount
            WHERE id = v_active_journal_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_cash_inflows ON public.daily_cash_operations;
CREATE TRIGGER tr_sync_cash_inflows
AFTER INSERT ON public.daily_cash_operations
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_cash_inflows();

-- GRANTS
GRANT EXECUTE ON FUNCTION public.fn_calculate_theoretical_cash(uuid) TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
GRANT SELECT ON public.notifications TO anon;
