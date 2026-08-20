-- Fusion Ibrahim Moussa (Utiliser dd02de57-78a9-4487-8afd-b7ac086cbdee comme survivant)
UPDATE public.sales SET client_id = 'dd02de57-78a9-4487-8afd-b7ac086cbdee' WHERE client_id IN (SELECT id FROM public.clients WHERE phone = '96123456' AND id != 'dd02de57-78a9-4487-8afd-b7ac086cbdee');
UPDATE public.reservations SET client_id = 'dd02de57-78a9-4487-8afd-b7ac086cbdee' WHERE client_id IN (SELECT id FROM public.clients WHERE phone = '96123456' AND id != 'dd02de57-78a9-4487-8afd-b7ac086cbdee');
DELETE FROM public.clients WHERE phone = '96123456' AND id != 'dd02de57-78a9-4487-8afd-b7ac086cbdee';

-- Fusion Charifa (Utiliser 4a297d3f-2864-472f-a0c0-e64cda5cbf24 comme survivant)
UPDATE public.sales SET client_id = '4a297d3f-2864-472f-a0c0-e64cda5cbf24' WHERE client_id IN (SELECT id FROM public.clients WHERE phone = '+227 96474265' AND id != '4a297d3f-2864-472f-a0c0-e64cda5cbf24');
DELETE FROM public.clients WHERE phone = '+227 96474265' AND id != '4a297d3f-2864-472f-a0c0-e64cda5cbf24';

-- Nettoyage des tests
DELETE FROM public.clients WHERE first_name = 'Test' AND last_name = 'Validation';

-- Renforcement de l'Intégrité : Contrainte unique sur le téléphone
ALTER TABLE public.clients ADD CONSTRAINT unique_client_phone UNIQUE (phone);

-- Mise à jour des RLS pour la table sales
DROP POLICY IF EXISTS "Super admins can do everything on sales" ON public.sales;
CREATE POLICY "Super admins can do everything on sales" ON public.sales FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff can select sales" ON public.sales;
CREATE POLICY "Staff can select sales" ON public.sales FOR SELECT TO authenticated USING (true);
