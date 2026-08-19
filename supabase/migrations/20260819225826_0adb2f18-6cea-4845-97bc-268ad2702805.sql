
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS notes text;
COMMENT ON COLUMN public.sales.notes IS 'Justification pour les conditions exceptionnelles (durée, prix, etc.)';
