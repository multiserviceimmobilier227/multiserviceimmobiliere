CREATE OR REPLACE FUNCTION public.update_plot_status_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Fix: Use 'en_cours' instead of 'Validée' to match the enum
    IF NEW.status = 'en_cours' AND (OLD.status IS NULL OR OLD.status != 'en_cours') THEN
        UPDATE public.plots 
        SET status = 'Vendue' 
        WHERE id = NEW.plot_id;
        
        -- Log status change in plot_status_history if the table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plot_status_history') THEN
            INSERT INTO public.plot_status_history (plot_id, status, changed_by)
            VALUES (NEW.plot_id, 'Vendue', NEW.validated_by_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
