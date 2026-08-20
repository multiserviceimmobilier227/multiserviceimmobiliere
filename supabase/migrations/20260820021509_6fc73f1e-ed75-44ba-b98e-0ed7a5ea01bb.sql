-- 1. Identifier l'utilisateur PDG
-- User ID: d2a66474-30df-4d82-9b98-9dc39a8ec045
-- Email: souleymaneoumarou2323@gmail.com

-- 2. Mise à jour des politiques RLS pour toutes les tables restantes (Acquisitions, Expense categories, etc.)
-- Acquisitions
DROP POLICY IF EXISTS "Super Admin all on acquisitions" ON public.acquisitions;
CREATE POLICY "Super Admin all on acquisitions" ON public.acquisitions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Expense Categories
DROP POLICY IF EXISTS "Super Admin all on expense_categories" ON public.expense_categories;
CREATE POLICY "Super Admin all on expense_categories" ON public.expense_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Sale Mutations
DROP POLICY IF EXISTS "Super Admin all on sale_mutations" ON public.sale_mutations;
CREATE POLICY "Super Admin all on sale_mutations" ON public.sale_mutations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Plot Pricing
DROP POLICY IF EXISTS "Super Admin all on plot_pricing" ON public.plot_pricing;
CREATE POLICY "Super Admin all on plot_pricing" ON public.plot_pricing FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Client Documents
DROP POLICY IF EXISTS "Super Admin all on client_documents" ON public.client_documents;
CREATE POLICY "Super Admin all on client_documents" ON public.client_documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Client Interactions
DROP POLICY IF EXISTS "Super Admin all on client_interactions" ON public.client_interactions;
CREATE POLICY "Super Admin all on client_interactions" ON public.client_interactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- App Settings
DROP POLICY IF EXISTS "Super Admin all on app_settings" ON public.app_settings;
CREATE POLICY "Super Admin all on app_settings" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- User Roles (Sécurité : le super admin peut voir/gérer les rôles)
DROP POLICY IF EXISTS "Super Admin all on user_roles" ON public.user_roles;
CREATE POLICY "Super Admin all on user_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
