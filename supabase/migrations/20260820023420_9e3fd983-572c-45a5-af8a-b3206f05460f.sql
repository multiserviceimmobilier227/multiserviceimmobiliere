-- 1. Supprimer les ventes de test
DELETE FROM public.sales WHERE plot_id IN (SELECT id FROM public.plots WHERE plot_number LIKE 'VALID-%');

-- 2. Supprimer les parcelles de test
DELETE FROM public.plots WHERE plot_number LIKE 'VALID-%';
