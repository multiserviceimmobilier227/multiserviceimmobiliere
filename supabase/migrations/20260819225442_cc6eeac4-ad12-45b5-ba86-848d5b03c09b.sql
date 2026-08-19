
-- Modification des tables pour la Phase 10
ALTER TABLE public.payment_schedules 
ADD COLUMN IF NOT EXISTS schedule_type text DEFAULT 'automatique',
ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS first_payment_date date;

-- Mise à jour des permissions
GRANT ALL ON public.payment_schedules TO authenticated;
GRANT ALL ON public.payment_schedules TO service_role;
GRANT ALL ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
