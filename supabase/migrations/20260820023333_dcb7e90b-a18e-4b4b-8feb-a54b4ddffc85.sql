-- Insertion de parcelles de test
INSERT INTO public.plots (plot_number, surface_area, base_price, status, ilot_id, site_id)
SELECT 
  'VALID-' || i, 
  400, 
  1000000, 
  'Disponible', 
  (SELECT id FROM public.ilots LIMIT 1),
  (SELECT id FROM public.sites LIMIT 1)
FROM generate_series(1, 15) i;
