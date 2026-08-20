
-- Ensure payment_schedules has the necessary columns and types
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_status') THEN
        CREATE TYPE public.schedule_status AS ENUM ('En attente', 'Partiel', 'Payé', 'Retard');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_type') THEN
        CREATE TYPE public.schedule_type AS ENUM ('automatique', 'manuel');
    END IF;
END $$;

-- Add amount_paid if not exists
ALTER TABLE public.payment_schedules 
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS schedule_type public.schedule_type DEFAULT 'automatique';

-- Attempt conversion if column exists and is not already the enum
DO $$
BEGIN
    ALTER TABLE public.payment_schedules 
    ALTER COLUMN status TYPE public.schedule_status USING status::text::public.schedule_status;
EXCEPTION
    WHEN others THEN
        -- If it fails, we keep the existing type but the logic will try to adapt
        NULL;
END $$;

-- Function to check schedule consistency
CREATE OR REPLACE FUNCTION public.fn_check_sale_schedule_consistency()
RETURNS TRIGGER AS $$
DECLARE
    total_scheduled NUMERIC(15,2);
    expected_balance NUMERIC(15,2);
BEGIN
    -- Only check for active sales with payment plans
    IF NEW.status IN ('en_cours', 'termine') THEN
        SELECT SUM(amount_due) INTO total_scheduled
        FROM public.payment_schedules
        WHERE sale_id = NEW.id;

        expected_balance := NEW.total_amount - COALESCE(NEW.deposit_amount, 0);

        -- Allow a 1 FCFA margin for rounding
        IF ABS(COALESCE(total_scheduled, 0) - expected_balance) > 1 THEN
            RAISE EXCEPTION 'Incohérence financière : Le total de l’échéancier (% FCFA) ne correspond pas au solde dû (% FCFA).', 
                total_scheduled, expected_balance;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on sales table
DROP TRIGGER IF EXISTS tr_check_sale_schedule_consistency ON public.sales;
CREATE TRIGGER tr_check_sale_schedule_consistency
AFTER INSERT OR UPDATE OF total_amount, deposit_amount, status ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.fn_check_sale_schedule_consistency();

-- Function to automatically mark late schedules
CREATE OR REPLACE FUNCTION public.fn_update_late_schedules()
RETURNS void AS $$
BEGIN
    UPDATE public.payment_schedules
    SET status = 'Retard'
    WHERE status IN ('En attente', 'Partiel')
      AND due_date < CURRENT_DATE
      AND amount_paid < amount_due;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_check_sale_schedule_consistency() TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_schedules TO authenticated;
GRANT ALL ON public.payment_schedules TO service_role;
