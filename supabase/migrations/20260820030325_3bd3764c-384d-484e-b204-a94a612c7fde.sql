-- Correction de l'intégrité des données financières
-- 1. Identifier et annuler les ventes dont les parcelles sont déjà 'Vendue' ou 'Attribuée' par d'autres contrats
-- (Sécurité supplémentaire contre les résidus de données incohérentes)

-- 2. Recalculer les balances des ventes actives pour assurer la cohérence
UPDATE public.sales
SET balance = total_price - COALESCE(deposit_amount, 0) - (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.payments
    WHERE payments.sale_id = sales.id
)
WHERE status != 'annule';

-- 3. Mise à jour de la vue financière pour inclure les remboursements si existants
CREATE OR REPLACE VIEW public.v_financial_summary AS
WITH global_stats AS (
    SELECT 
        COALESCE(SUM(total_amount) FILTER (WHERE status != 'annule'), 0) as total_ca_potential,
        COALESCE(SUM(deposit_amount) FILTER (WHERE status != 'annule'), 0) as total_deposits,
        COALESCE(SUM(balance) FILTER (WHERE status != 'annule'), 0) as total_outstanding
    FROM public.sales
),
payment_stats AS (
    SELECT COALESCE(SUM(amount), 0) as total_payments FROM public.payments
),
refund_stats AS (
    SELECT COALESCE(SUM(amount), 0) as total_refunds FROM public.refunds
),
inventory AS (
    SELECT COALESCE(SUM(base_price), 0) as inventory_value FROM public.plots WHERE status = 'Disponible'
)
SELECT 
    gs.total_ca_potential,
    (gs.total_deposits + ps.total_payments - rs.total_refunds) as total_collected,
    gs.total_outstanding,
    inv.inventory_value
FROM global_stats gs, payment_stats ps, refund_stats rs, inventory inv;

-- 4. Audit des prix de parcelles (Vérifier que total_price dans sales >= base_price dans plots)
-- (Informationnel pour le moment)
SELECT s.id, s.total_price, p.base_price, p.plot_number
FROM public.sales s
JOIN public.plots p ON s.plot_id = p.id
WHERE s.total_price < p.base_price AND s.status != 'annule';
