-- 1. Identify and cancel all duplicate active sales across the entire database
WITH ranked_sales AS (
    SELECT id, 
           ROW_NUMBER() OVER(PARTITION BY plot_id ORDER BY created_at ASC) as rn
    FROM public.sales
    WHERE status IN ('reservation', 'en_cours', 'termine')
)
UPDATE public.sales
SET status = 'annule'
WHERE id IN (SELECT id FROM ranked_sales WHERE rn > 1);

-- 2. Create the unique index to prevent any future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_sale_per_plot 
ON public.sales (plot_id) 
WHERE (status IN ('reservation', 'en_cours', 'termine'));

-- 3. Sync plot status to match reality
UPDATE public.plots p
SET status = 'Attribuée'
WHERE EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.plot_id = p.id 
      AND s.status IN ('reservation', 'en_cours', 'termine')
);

UPDATE public.plots p
SET status = 'Disponible'
WHERE NOT EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.plot_id = p.id 
      AND s.status IN ('reservation', 'en_cours', 'termine')
);
