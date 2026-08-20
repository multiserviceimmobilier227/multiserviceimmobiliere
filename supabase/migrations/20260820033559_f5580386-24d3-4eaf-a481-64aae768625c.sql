-- Phase A-05.2 : Renforcement du Verrouillage et Audit d'Intégrité

-- 1. S'assurer que plot_id dans sales pointe vers une parcelle existante (déjà le cas via FK, mais on durcit les triggers)
CREATE OR REPLACE FUNCTION public.fn_audit_integrity_violation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Cette fonction peut être appelée manuellement ou par trigger pour logguer des anomalies
    INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        auth.uid(),
        'INTEGRITY_ALERT',
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'INSERT' THEN NEW.id ELSE OLD.id END,
        jsonb_build_object('reason', 'Tentative de violation d''intégrité ou incohérence détectée'),
        jsonb_build_object('op', TG_OP, 'data', CASE WHEN TG_OP = 'INSERT' THEN row_to_json(NEW) ELSE row_to_json(OLD) END)
    );
    RETURN NULL;
END;
$$;

-- 2. Trigger pour détecter les tentatives de suppression de parcelles avec des ventes actives (protection supplémentaire)
CREATE OR REPLACE FUNCTION public.fn_prevent_plot_deletion_with_sales()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.sales WHERE plot_id = OLD.id AND status IN ('reservation', 'en_cours', 'termine')) THEN
        -- Log l'alerte avant de bloquer
        INSERT INTO public.audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values
        ) VALUES (
            auth.uid(),
            'CRITICAL_INTEGRITY_VIOLATION',
            'plots',
            OLD.id,
            jsonb_build_object('error', 'Tentative de suppression d''une parcelle vendue', 'plot_number', OLD.plot_number)
        );
        RAISE EXCEPTION 'Impossible de supprimer une parcelle associée à une vente active.';
    END IF;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_plot_deletion_with_sales ON public.plots;
CREATE TRIGGER tr_prevent_plot_deletion_with_sales
BEFORE DELETE ON public.plots
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_plot_deletion_with_sales();

-- 3. Mise à jour de la vue financière pour inclure les alertes d'intégrité
DROP VIEW IF EXISTS public.v_financial_summary;
CREATE OR REPLACE VIEW public.v_financial_summary AS
WITH monthly_metrics AS (
    SELECT
        COALESCE(SUM(total_amount), 0) as monthly_sales,
        COUNT(*) as sales_count
    FROM public.sales
    WHERE status IN ('reservation', 'en_cours', 'termine')
      AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
),
collection_metrics AS (
    SELECT
        COALESCE(SUM(amount), 0) as monthly_collections
    FROM public.payments
    WHERE date_trunc('month', payment_date) = date_trunc('month', CURRENT_DATE)
),
global_metrics AS (
    SELECT
        COALESCE(SUM(total_amount), 0) as total_ca_potential,
        COALESCE(SUM(balance), 0) as total_outstanding,
        COUNT(*) as active_sales_count
    FROM public.sales
    WHERE status IN ('reservation', 'en_cours', 'termine')
),
payment_metrics AS (
    SELECT
        COALESCE(SUM(amount), 0) as total_payments
    FROM public.payments
),
refund_metrics AS (
    SELECT
        COALESCE(SUM(amount), 0) as total_refunds
    FROM public.refunds
),
stock_metrics AS (
    SELECT
        COALESCE(SUM(base_price), 0) as stock_value,
        COUNT(*) as total_real_plots
    FROM public.plots
    WHERE status = 'Disponible'
),
total_plots_count AS (
    SELECT COUNT(*) as total_count FROM public.plots
),
integrity_metrics AS (
    SELECT COUNT(*) as integrity_alerts
    FROM public.audit_logs
    WHERE action IN ('INTEGRITY_ALERT', 'CRITICAL_INTEGRITY_VIOLATION')
      AND created_at > (CURRENT_DATE - INTERVAL '7 days')
)
SELECT
    m.monthly_sales,
    m.sales_count as monthly_sales_count,
    c.monthly_collections,
    g.total_ca_potential,
    g.total_outstanding,
    g.active_sales_count,
    (p.total_payments - r.total_refunds) as total_collected_net,
    s.stock_value,
    s.total_real_plots as available_plots_count,
    tp.total_count as total_plots_in_system,
    i.integrity_alerts
FROM monthly_metrics m, collection_metrics c, global_metrics g, payment_metrics p, refund_metrics r, stock_metrics s, total_plots_count tp, integrity_metrics i;

GRANT SELECT ON public.v_financial_summary TO authenticated;
GRANT ALL ON public.v_financial_summary TO service_role;
