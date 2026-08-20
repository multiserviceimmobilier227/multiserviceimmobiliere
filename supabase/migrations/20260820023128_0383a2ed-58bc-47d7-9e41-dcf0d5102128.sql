-- 1. Restore the sync function with security definer
CREATE OR REPLACE FUNCTION public.fn_sync_plot_status_integrity()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.status IN ('reservation', 'en_cours', 'termine') THEN
            UPDATE public.plots 
            SET status = 'Attribuée' 
            WHERE id = NEW.plot_id;
        ELSIF NEW.status = 'annule' THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.sales 
                WHERE plot_id = NEW.plot_id 
                  AND id <> NEW.id 
                  AND status IN ('reservation', 'en_cours', 'termine')
            ) THEN
                UPDATE public.plots 
                SET status = 'Disponible' 
                WHERE id = NEW.plot_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach trigger
DROP TRIGGER IF EXISTS tr_sync_plot_status_integrity ON public.sales;
CREATE TRIGGER tr_sync_plot_status_integrity
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_plot_status_integrity();

-- 3. Secure functions (Revoke PUBLIC, grant to internal roles)
REVOKE EXECUTE ON FUNCTION public.fn_sync_plot_status_integrity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_sync_plot_status_integrity() TO service_role;

-- Ensure has_role is also secured
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;
