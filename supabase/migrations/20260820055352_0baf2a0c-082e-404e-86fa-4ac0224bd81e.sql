
DROP FUNCTION IF EXISTS public.fn_calculate_theoretical_cash(uuid);

-- 1. Function to calculate theoretical cash
CREATE OR REPLACE FUNCTION public.fn_calculate_theoretical_cash(_journal_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_opening numeric;
    v_inflows numeric;
    v_outflows numeric;
BEGIN
    -- Get opening balance
    SELECT opening_balance INTO v_opening 
    FROM cash_journals 
    WHERE id = _journal_id;

    -- Sum validated inflows (sales/payments) linked to this journal
    SELECT COALESCE(SUM(amount), 0) INTO v_inflows
    FROM daily_cash_operations
    WHERE cash_journal_id = _journal_id 
      AND operation_type = 'ENTREE';

    -- Sum validated outflows (expenses) linked to this journal
    SELECT COALESCE(SUM(amount), 0) INTO v_outflows
    FROM expenses
    WHERE cash_journal_id = _journal_id 
      AND status = 'validé';

    RETURN COALESCE(v_opening, 0) + v_inflows - v_outflows;
END;
$$;

-- 2. Trigger to sync balance on journal when operations change
CREATE OR REPLACE FUNCTION public.fn_sync_journal_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_journal_id uuid;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_journal_id := OLD.cash_journal_id;
    ELSE
        v_journal_id := NEW.cash_journal_id;
    END IF;

    IF v_journal_id IS NOT NULL THEN
        UPDATE cash_journals 
        SET theoretical_closing_balance = fn_calculate_theoretical_cash(v_journal_id)
        WHERE id = v_journal_id;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_cash_journal_balance_ops ON public.daily_cash_operations;
CREATE TRIGGER tr_sync_cash_journal_balance_ops
AFTER INSERT OR UPDATE OR DELETE ON public.daily_cash_operations
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_journal_balance();

DROP TRIGGER IF EXISTS tr_sync_cash_journal_balance_exp ON public.expenses;
CREATE TRIGGER tr_sync_cash_journal_balance_exp
AFTER INSERT OR UPDATE OR DELETE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_journal_balance();

-- 3. Prevent expense deletion
CREATE OR REPLACE FUNCTION public.fn_prevent_deletion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'Suppression interdite pour garantir la traçabilité. Utilisez la procédure Annule et Remplace.';
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_expense_deletion ON public.expenses;
CREATE TRIGGER tr_prevent_expense_deletion
BEFORE DELETE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_deletion();

-- 4. Lock closed cash journal
CREATE OR REPLACE FUNCTION public.fn_lock_closed_cash_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status text;
    v_journal_id uuid;
BEGIN
    v_journal_id := NEW.cash_journal_id;
    
    IF v_journal_id IS NOT NULL THEN
        SELECT status INTO v_status FROM cash_journals WHERE id = v_journal_id;
        IF v_status = 'fermé' THEN
            RAISE EXCEPTION 'Action impossible : la session de caisse est clôturée.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_lock_closed_cash_day ON public.expenses;
CREATE TRIGGER tr_lock_closed_cash_day
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_lock_closed_cash_journal();

-- 5. Notifications
CREATE OR REPLACE FUNCTION public.fn_notify_pdg(_title text, _message text, _agency_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pdg_id uuid;
BEGIN
    -- Find PDG
    SELECT user_id INTO v_pdg_id 
    FROM user_roles 
    WHERE role = 'pdg' 
    LIMIT 1;

    IF v_pdg_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, agency_id)
        VALUES (v_pdg_id, _title, _message, 'finance', _agency_id);
    END IF;
END;
$$;

-- Large expense notification
CREATE OR REPLACE FUNCTION public.fn_tr_notify_pdg_large_expense()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.amount > 100000 THEN
        PERFORM fn_notify_pdg(
            'Dépense importante',
            'Une dépense de ' || NEW.amount || ' FCFA a été soumise pour validation (' || NEW.description || ').',
            NEW.agency_id
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_pdg_on_large_expense ON public.expenses;
CREATE TRIGGER tr_notify_pdg_on_large_expense
AFTER INSERT ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_tr_notify_pdg_large_expense();

-- Cash discrepancy notification
CREATE OR REPLACE FUNCTION public.fn_tr_notify_pdg_cash_discrepancy()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF ABS(NEW.discrepancy) > 5000 THEN
        PERFORM fn_notify_pdg(
            'Écart de caisse important',
            'Un écart de ' || NEW.discrepancy || ' FCFA a été constaté lors de la clôture de caisse.',
            NEW.agency_id
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_pdg_on_cash_discrepancy ON public.cash_journals;
CREATE TRIGGER tr_notify_pdg_on_cash_discrepancy
AFTER UPDATE OF status ON public.cash_journals
FOR EACH ROW 
WHEN (NEW.status = 'fermé')
EXECUTE FUNCTION public.fn_tr_notify_pdg_cash_discrepancy();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_calculate_theoretical_cash(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_notify_pdg(text, text, uuid) TO authenticated;
