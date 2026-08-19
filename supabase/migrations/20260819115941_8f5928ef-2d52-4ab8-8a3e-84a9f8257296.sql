-- Create reservation status enum
DO $$ BEGIN
    CREATE TYPE public.reservation_status AS ENUM ('active', 'converted', 'expired', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id uuid REFERENCES public.plots(id) NOT NULL,
    client_id uuid REFERENCES public.clients(id) NOT NULL,
    created_by uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    expires_at timestamptz NOT NULL,
    status public.reservation_status DEFAULT 'active' NOT NULL,
    reminder_sent_at timestamptz,
    cancellation_reason text
);

-- Grant access
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Use user_roles table for role checking instead of non-existent has_permission function
CREATE POLICY "Users can view all reservations" 
    ON public.reservations FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Authorized users can create reservations" 
    ON public.reservations FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('pdg', 'informaticien', 'secretaire', 'commercial')
        )
    );

CREATE POLICY "Authorized users can update reservations" 
    ON public.reservations FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('pdg', 'informaticien', 'secretaire', 'commercial')
        )
    );

-- Trigger for audit logging
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_reservations_trigger') THEN
        CREATE TRIGGER audit_reservations_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.reservations
        FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
    END IF;
END $$;

-- Add new permissions to role_permissions table
-- Check if table exists first (it should based on previous turn logs)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions' AND table_schema = 'public') THEN
        INSERT INTO public.role_permissions (role, permission)
        VALUES 
            ('pdg', 'view_reservations'),
            ('pdg', 'create_reservation'),
            ('pdg', 'manage_reservations'),
            ('informaticien', 'view_reservations'),
            ('informaticien', 'create_reservation'),
            ('informaticien', 'manage_reservations'),
            ('commercial', 'view_reservations'),
            ('commercial', 'create_reservation'),
            ('secretaire', 'view_reservations'),
            ('secretaire', 'create_reservation')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Function to handle plot status update on reservation
CREATE OR REPLACE FUNCTION public.handle_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status = 'active' THEN
            UPDATE public.plots 
            SET status = 'Réservée' 
            WHERE id = NEW.plot_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF NEW.status = 'active' AND OLD.status != 'active' THEN
            UPDATE public.plots 
            SET status = 'Réservée' 
            WHERE id = NEW.plot_id;
        ELSIF NEW.status IN ('expired', 'cancelled') AND OLD.status = 'active' THEN
            IF NOT EXISTS (SELECT 1 FROM public.reservations WHERE plot_id = NEW.plot_id AND status = 'active' AND id != NEW.id) THEN
                UPDATE public.plots 
                SET status = 'Disponible' 
                WHERE id = NEW.plot_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'reservation_plot_status_trigger') THEN
        CREATE TRIGGER reservation_plot_status_trigger
        AFTER INSERT OR UPDATE ON public.reservations
        FOR EACH ROW EXECUTE FUNCTION public.handle_reservation_status_change();
    END IF;
END $$;
