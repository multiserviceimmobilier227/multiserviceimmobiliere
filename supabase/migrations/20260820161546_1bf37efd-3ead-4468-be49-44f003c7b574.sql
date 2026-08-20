
-- 1. Function to create a notification
CREATE OR REPLACE FUNCTION public.fn_create_notification(
    _user_id UUID,
    _title TEXT,
    _message TEXT,
    _type TEXT DEFAULT 'info',
    _sale_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, sale_id)
    VALUES (_user_id, _title, _message, _type, _sale_id);
END;
$$;

-- 2. Trigger function to notify agent and PDG on payment due/overdue
-- This is a simplified version that checks on schedule updates or can be called by a cron
-- For now, let's create a function that handles the logic which we can hook into or run via cron
CREATE OR REPLACE FUNCTION public.fn_check_and_notify_arrears()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r RECORD;
    _pdg_id UUID;
BEGIN
    -- Get PDG user ID (first user with 'pdg' role)
    SELECT user_id INTO _pdg_id FROM public.user_roles WHERE role = 'pdg' LIMIT 1;

    -- J-7: Internal notification for agents
    FOR r IN 
        SELECT ps.sale_id, s.prepared_by_id, s.agency_id, ps.due_date, c.first_name || ' ' || c.last_name as client_name
        FROM public.payment_schedules ps
        JOIN public.sales s ON ps.sale_id = s.id
        JOIN public.clients c ON s.client_id = c.id
        WHERE ps.status != 'Payé' 
          AND ps.due_date = CURRENT_DATE + INTERVAL '7 days'
          AND (ps.last_reminder_sent_at IS NULL OR ps.last_reminder_sent_at < CURRENT_DATE)
    LOOP
        PERFORM public.fn_create_notification(
            r.prepared_by_id,
            'Échéance à J-7',
            'Le client ' || r.client_name || ' a une échéance prévue pour le ' || r.due_date,
            'info',
            r.sale_id
        );
        UPDATE public.payment_schedules SET last_reminder_sent_at = NOW() WHERE sale_id = r.sale_id AND due_date = r.due_date;
    END LOOP;

    -- J-2: Reminder
    FOR r IN 
        SELECT ps.sale_id, s.prepared_by_id, ps.due_date, c.first_name || ' ' || c.last_name as client_name
        FROM public.payment_schedules ps
        JOIN public.sales s ON ps.sale_id = s.id
        JOIN public.clients c ON s.client_id = c.id
        WHERE ps.status != 'Payé' 
          AND ps.due_date = CURRENT_DATE + INTERVAL '2 days'
          AND (ps.last_reminder_sent_at IS NULL OR ps.last_reminder_sent_at < CURRENT_DATE)
    LOOP
        PERFORM public.fn_create_notification(
            r.prepared_by_id,
            'Rappel Échéance J-2',
            'Urgent : Échéance dans 2 jours pour ' || r.client_name,
            'warning',
            r.sale_id
        );
        UPDATE public.payment_schedules SET last_reminder_sent_at = NOW() WHERE sale_id = r.sale_id AND due_date = r.due_date;
    END LOOP;

    -- J+1: Overdue Alert
    FOR r IN 
        SELECT ps.sale_id, s.prepared_by_id, ps.due_date, c.first_name || ' ' || c.last_name as client_name
        FROM public.payment_schedules ps
        JOIN public.sales s ON ps.sale_id = s.id
        JOIN public.clients c ON s.client_id = c.id
        WHERE ps.status != 'Payé' 
          AND ps.due_date = CURRENT_DATE - INTERVAL '1 day'
          AND (ps.last_reminder_sent_at IS NULL OR ps.last_reminder_sent_at < CURRENT_DATE)
    LOOP
        PERFORM public.fn_create_notification(
            r.prepared_by_id,
            'RETARD : Échéance impayée',
            'L''échéance du ' || r.due_date || ' pour ' || r.client_name || ' est maintenant en retard.',
            'error',
            r.sale_id
        );
        UPDATE public.payment_schedules SET last_reminder_sent_at = NOW() WHERE sale_id = r.sale_id AND due_date = r.due_date;
    END LOOP;

    -- J+60: PDG Alert for Critical Delay
    IF _pdg_id IS NOT NULL THEN
        FOR r IN 
            SELECT sale_id, client_name, total_arrears, days_overdue
            FROM public.v_sale_arrears
            WHERE is_critical_delay = TRUE
              AND sale_id NOT IN (
                  SELECT (new_data->>'sale_id')::UUID 
                  FROM public.audit_logs 
                  WHERE action = 'NOTIFY_PDG_CRITICAL_ARREARS' 
                    AND created_at > NOW() - INTERVAL '7 days'
              )
        LOOP
            PERFORM public.fn_create_notification(
                _pdg_id,
                'ALERTE CRITIQUE : Retard > 2 mois',
                'Le client ' || r.client_name || ' présente un retard critique de ' || r.days_overdue || ' jours (' || r.total_arrears || ' FCFA).',
                'error',
                r.sale_id
            );
            
            -- Log to prevent spamming the PDG every day for the same sale
            INSERT INTO public.audit_logs (action, table_name, record_id, new_data)
            VALUES ('NOTIFY_PDG_CRITICAL_ARREARS', 'sales', r.sale_id, jsonb_build_object('sale_id', r.sale_id, 'client_name', r.client_name));
        END LOOP;
    END IF;
END;
$$;

-- 3. Grants
GRANT EXECUTE ON FUNCTION public.fn_create_notification(UUID, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_check_and_notify_arrears() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_check_and_notify_arrears() TO service_role;
