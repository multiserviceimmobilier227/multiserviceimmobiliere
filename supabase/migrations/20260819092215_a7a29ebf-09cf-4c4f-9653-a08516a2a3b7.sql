
-- 1. Add validation columns to acquisitions and sales
ALTER TABLE public.acquisitions 
ADD COLUMN prepared_by_id uuid REFERENCES auth.users(id),
ADD COLUMN validated_by_id uuid REFERENCES auth.users(id),
ADD COLUMN validation_date timestamp with time zone;

ALTER TABLE public.sales 
ADD COLUMN prepared_by_id uuid REFERENCES auth.users(id),
ADD COLUMN validated_by_id uuid REFERENCES auth.users(id),
ADD COLUMN validation_date timestamp with time zone;

-- 2. Trigger function to prevent editing validated records
CREATE OR REPLACE FUNCTION private.prevent_validated_edit()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow Informaticien to bypass validation lock
    IF OLD.validated_by_id IS NOT NULL AND NOT private.has_role(auth.uid(), 'informaticien') THEN
        RAISE EXCEPTION 'Opération verrouillée : cette donnée a déjà été validée par le PDG et ne peut plus être modifiée.';
    END IF;
    RETURN NEW;
END;
$$;

-- 3. Apply triggers
CREATE TRIGGER tr_lock_validated_acquisition
BEFORE UPDATE ON public.acquisitions
FOR EACH ROW EXECUTE FUNCTION private.prevent_validated_edit();

CREATE TRIGGER tr_lock_validated_sale
BEFORE UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION private.prevent_validated_edit();

-- 4. RLS update: Only PDG can validate
CREATE POLICY "PDG can validate acquisitions"
ON public.acquisitions
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'pdg'))
WITH CHECK (private.has_role(auth.uid(), 'pdg'));

CREATE POLICY "PDG can validate sales"
ON public.sales
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'pdg'))
WITH CHECK (private.has_role(auth.uid(), 'pdg'));

-- Grant access to auth metadata for staff to see who prepared/validated
GRANT SELECT ON public.acquisitions TO authenticated;
GRANT SELECT ON public.sales TO authenticated;
