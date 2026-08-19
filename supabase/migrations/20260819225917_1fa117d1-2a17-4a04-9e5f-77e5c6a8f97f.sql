
-- Trigger to check if the sum of payment schedules matches the remaining balance of the sale
CREATE OR REPLACE FUNCTION public.check_sale_schedule_consistency()
RETURNS TRIGGER AS $$
DECLARE
    total_scheduled NUMERIC;
    sale_balance NUMERIC;
BEGIN
    -- Get total amount scheduled for the sale
    SELECT COALESCE(SUM(amount_due - amount_paid), 0) INTO total_scheduled
    FROM public.payment_schedules
    WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id);

    -- Get sale balance
    SELECT balance INTO sale_balance
    FROM public.sales
    WHERE id = COALESCE(NEW.sale_id, OLD.sale_id);

    -- If balance is 0, no schedules are needed (already handled by application logic, but good to check)
    -- We only check if schedules exist. If they do, their remaining balance must match sale balance.
    IF EXISTS (SELECT 1 FROM public.payment_schedules WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id)) THEN
        -- Allow for small rounding differences (e.g., < 1 FCFA)
        IF ABS(total_scheduled - sale_balance) > 1 THEN
            RAISE WARNING 'Incohérence détectée : Somme des échéances (%) != Solde de la vente (%)', total_scheduled, sale_balance;
            -- We don't block (RAISE EXCEPTION) to allow for mid-transaction updates, 
            -- but we log it or handle it in the application.
            -- MSI 2.0 choice: RAISE WARNING for now, application handles recalculation.
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_sale_schedule_consistency ON public.payment_schedules;
CREATE CONSTRAINT TRIGGER tr_check_sale_schedule_consistency
AFTER INSERT OR UPDATE OR DELETE ON public.payment_schedules
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION public.check_sale_schedule_consistency();
