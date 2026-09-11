CREATE POLICY "Personnel habilité ouvre la caisse de son agence"
ON public.cash_journals FOR INSERT TO authenticated
WITH CHECK (
  opened_by_id = auth.uid()
  AND (
    public.has_permission(auth.uid(), 'manage_cash_journal')
    OR public.has_role(auth.uid(), 'pdg'::public.app_role)
    OR public.has_role(auth.uid(), 'comptable'::public.app_role)
    OR public.has_role(auth.uid(), 'responsable_agence'::public.app_role)
  )
);

CREATE POLICY "Personnel habilité met à jour la caisse de son agence"
ON public.cash_journals FOR UPDATE TO authenticated
USING (
  public.has_permission(auth.uid(), 'manage_cash_journal')
  OR public.has_role(auth.uid(), 'pdg'::public.app_role)
  OR public.has_role(auth.uid(), 'comptable'::public.app_role)
  OR public.has_role(auth.uid(), 'responsable_agence'::public.app_role)
)
WITH CHECK (
  public.has_permission(auth.uid(), 'manage_cash_journal')
  OR public.has_role(auth.uid(), 'pdg'::public.app_role)
  OR public.has_role(auth.uid(), 'comptable'::public.app_role)
  OR public.has_role(auth.uid(), 'responsable_agence'::public.app_role)
);