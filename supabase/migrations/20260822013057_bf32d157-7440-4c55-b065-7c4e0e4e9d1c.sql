
-- 1. Staff helper
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role <> 'client'::public.app_role
  );
$$;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

-- 2. has_role(text): exact match only (no implicit super_admin shortcut)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role
  );
$$;

-- 3. clients: authenticated-only insert, bound to author
DROP POLICY IF EXISTS "Allow inserts for clients" ON public.clients;
CREATE POLICY "Staff can insert clients" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND created_by = auth.uid());

DROP POLICY IF EXISTS "Allow select for clients" ON public.clients;
CREATE POLICY "Staff can select clients" ON public.clients
  FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS "Allow update for clients" ON public.clients;
CREATE POLICY "Staff can update clients" ON public.clients
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "Allow delete for clients" ON public.clients;
CREATE POLICY "Managers can delete clients" ON public.clients
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'pdg') OR public.has_role(auth.uid(),'super_admin'));

-- 4. profiles: no anonymous exposure
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. Restrict broad SELECT/ALL "true" policies on sensitive tables to staff
DROP POLICY IF EXISTS "Authenticated users can read sales" ON public.sales;
CREATE POLICY "Staff can read sales" ON public.sales FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS "Staff can select sales" ON public.sales;
DROP POLICY IF EXISTS "Users can view sales of their agency" ON public.sales;
DROP POLICY IF EXISTS "Collaborators can create sales" ON public.sales;
CREATE POLICY "Staff can create sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can read payments" ON public.payments;
CREATE POLICY "Staff can read payments" ON public.payments FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Users can view acquisitions" ON public.acquisitions;
CREATE POLICY "Staff can view acquisitions" ON public.acquisitions FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS "Users can view acquisition costs" ON public.acquisition_costs;
CREATE POLICY "Staff can view acquisition costs" ON public.acquisition_costs FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Users can view plot pricing" ON public.plot_pricing;
CREATE POLICY "Staff can view plot pricing" ON public.plot_pricing FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can view contracts" ON public.contracts;
CREATE POLICY "Staff can view contracts" ON public.contracts FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS "Collaborators can create contracts" ON public.contracts;
CREATE POLICY "Staff can create contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can view contract snapshots" ON public.contract_snapshots;
CREATE POLICY "Staff can view contract snapshots" ON public.contract_snapshots FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can view mutations" ON public.sale_mutations;
CREATE POLICY "Staff can view mutations" ON public.sale_mutations FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Users can view transfers" ON public.sale_transfers;
CREATE POLICY "Staff can view transfers" ON public.sale_transfers FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Users can view adjustments for their agency sales" ON public.sale_adjustments;
CREATE POLICY "Staff can view adjustments" ON public.sale_adjustments FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Allow select on payment_schedules" ON public.payment_schedules;
CREATE POLICY "Staff can select payment schedules" ON public.payment_schedules FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS "Allow insert on payment_schedules" ON public.payment_schedules;
CREATE POLICY "Staff can insert payment schedules" ON public.payment_schedules FOR INSERT TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "Allow update on payment_schedules" ON public.payment_schedules;
CREATE POLICY "Staff can update payment schedules" ON public.payment_schedules FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "Allow delete on payment_schedules" ON public.payment_schedules;
CREATE POLICY "Managers can delete payment schedules" ON public.payment_schedules FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'pdg') OR public.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "Users can view client documents" ON public.client_documents;
CREATE POLICY "Staff can view client documents" ON public.client_documents FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS "Authenticated users can manage client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can add client documents" ON public.client_documents;
CREATE POLICY "Staff can add client documents" ON public.client_documents FOR INSERT TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Users can view client interactions" ON public.client_interactions;
CREATE POLICY "Staff can view client interactions" ON public.client_interactions FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS "Authenticated users can manage client interactions" ON public.client_interactions;
CREATE POLICY "Staff can manage client interactions" ON public.client_interactions FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- 6. Storage: ownership / role checks
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
CREATE POLICY "Owners and managers can view client documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'client_documents' AND (
      owner = auth.uid()
      OR EXISTS (SELECT 1 FROM public.client_documents cd WHERE cd.created_by = auth.uid() AND cd.file_url LIKE '%' || storage.objects.name)
      OR public.has_role(auth.uid(),'pdg') OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'responsable_agence')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Staff can upload client documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client_documents' AND owner = auth.uid() AND public.is_staff());

DROP POLICY IF EXISTS "Justificatifs access policy" ON storage.objects;
CREATE POLICY "Staff can upload justificatifs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'justificatifs_depenses' AND owner = auth.uid() AND public.is_staff());
CREATE POLICY "Owners and finance can view justificatifs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'justificatifs_depenses' AND (
      owner = auth.uid()
      OR EXISTS (SELECT 1 FROM public.expenses e WHERE e.created_by_id = auth.uid() AND e.receipt_url LIKE '%' || storage.objects.name)
      OR public.has_role(auth.uid(),'pdg') OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'comptable')
    )
  );
CREATE POLICY "Owners and finance can update justificatifs" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'justificatifs_depenses' AND (owner = auth.uid() OR public.has_role(auth.uid(),'pdg') OR public.has_role(auth.uid(),'super_admin')))
  WITH CHECK (bucket_id = 'justificatifs_depenses');
CREATE POLICY "Managers can delete justificatifs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'justificatifs_depenses' AND (public.has_role(auth.uid(),'pdg') OR public.has_role(auth.uid(),'super_admin')));

-- 7. In-function authorization for SECURITY DEFINER RPCs callable by signed-in users
CREATE OR REPLACE FUNCTION public.fn_get_payment_imputation_preview(p_sale_id uuid, p_amount numeric)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
    v_remaining_amount NUMERIC(15,2) := p_amount;
    v_imputed_items JSONB := '[]'::jsonb;
    v_schedule RECORD;
    v_needed NUMERIC(15,2);
    v_apply NUMERIC(15,2);
BEGIN
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;
    FOR v_schedule IN 
        SELECT id, amount_due, amount_paid, due_date
        FROM public.payment_schedules
        WHERE sale_id = p_sale_id 
          AND status IN ('En attente', 'Partiel', 'Retard')
        ORDER BY due_date ASC
    LOOP
        EXIT WHEN v_remaining_amount <= 0;
        v_needed := v_schedule.amount_due - COALESCE(v_schedule.amount_paid, 0);
        v_apply := LEAST(v_remaining_amount, v_needed);
        IF v_apply > 0 THEN
            v_imputed_items := v_imputed_items || jsonb_build_object(
                'schedule_id', v_schedule.id,
                'due_date', v_schedule.due_date,
                'amount_applied', v_apply,
                'type', CASE WHEN v_schedule.due_date < CURRENT_DATE THEN 'Retard' ELSE 'Courant' END
            );
            v_remaining_amount := v_remaining_amount - v_apply;
        END IF;
    END LOOP;
    IF v_remaining_amount > 0 THEN
        v_imputed_items := v_imputed_items || jsonb_build_object(
            'schedule_id', NULL, 'due_date', NULL,
            'amount_applied', v_remaining_amount, 'type', 'Excédent / Anticipation'
        );
    END IF;
    RETURN v_imputed_items;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_impute_payment_on_schedule(p_payment_id uuid, p_sale_id uuid, p_amount numeric)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
    v_remaining_amount NUMERIC(15,2) := p_amount;
    v_imputed_items JSONB := '[]'::jsonb;
    v_schedule RECORD;
    v_apply NUMERIC(15,2);
    v_needed NUMERIC(15,2);
    v_new_paid NUMERIC(15,2);
BEGIN
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;
    FOR v_schedule IN 
        SELECT id, amount_due, amount_paid, due_date
        FROM public.payment_schedules
        WHERE sale_id = p_sale_id 
          AND status IN ('En attente', 'Partiel', 'Retard')
        ORDER BY due_date ASC
    LOOP
        EXIT WHEN v_remaining_amount <= 0;
        v_needed := v_schedule.amount_due - COALESCE(v_schedule.amount_paid, 0);
        v_apply := LEAST(v_remaining_amount, v_needed);
        IF v_apply > 0 THEN
            v_new_paid := COALESCE(v_schedule.amount_paid, 0) + v_apply;
            UPDATE public.payment_schedules
            SET amount_paid = v_new_paid,
                status = CASE WHEN v_new_paid >= v_schedule.amount_due THEN 'Payé'::public.schedule_status ELSE 'Partiel'::public.schedule_status END,
                updated_at = now()
            WHERE id = v_schedule.id;
            v_imputed_items := v_imputed_items || jsonb_build_object(
                'schedule_id', v_schedule.id,
                'due_date', v_schedule.due_date,
                'amount_applied', v_apply,
                'type', CASE WHEN v_schedule.due_date < CURRENT_DATE THEN 'Retard' ELSE 'Courant' END
            );
            v_remaining_amount := v_remaining_amount - v_apply;
        END IF;
    END LOOP;
    IF v_remaining_amount > 0 THEN
         v_imputed_items := v_imputed_items || jsonb_build_object(
            'schedule_id', NULL, 'due_date', NULL,
            'amount_applied', v_remaining_amount, 'type', 'Excédent / Anticipation'
        );
    END IF;
    UPDATE public.payments SET imputed_data = v_imputed_items WHERE id = p_payment_id;
    RETURN v_imputed_items;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_calculate_sale_arrears(_sale_id uuid)
 RETURNS TABLE(total_arrears numeric, oldest_unpaid_due_date date, days_overdue integer, is_critical_delay boolean)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;
    RETURN QUERY
    SELECT 
        SUM(ps.amount_due - COALESCE(ps.amount_paid, 0)),
        MIN(ps.due_date),
        (CURRENT_DATE - MIN(ps.due_date))::INTEGER,
        (CURRENT_DATE - MIN(ps.due_date) > 60)
    FROM public.payment_schedules ps
    WHERE ps.sale_id = _sale_id 
      AND ps.status != 'Payé' 
      AND ps.due_date < CURRENT_DATE;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.fn_check_and_notify_arrears() FROM authenticated;
