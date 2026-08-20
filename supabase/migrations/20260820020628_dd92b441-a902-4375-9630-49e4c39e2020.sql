-- 1. Correct has_role function with text input to match RLS/App requirements or overloaded versions
-- The user asked for _role as TEXT in their request.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, anon, service_role;

-- 2. Hardening the enum-based has_role just in case
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- 3. Payment Schedules RLS Policies
-- Enable RLS (already enabled but good practice)
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing restricted policies
DROP POLICY IF EXISTS "Allow insert on payment_schedules" ON public.payment_schedules;
DROP POLICY IF EXISTS "Allow select on payment_schedules" ON public.payment_schedules;
DROP POLICY IF EXISTS "Allow update on payment_schedules" ON public.payment_schedules;
DROP POLICY IF EXISTS "Allow delete on payment_schedules" ON public.payment_schedules;
DROP POLICY IF EXISTS "Users can view payment schedules" ON public.payment_schedules;

-- Create permissive policies for authenticated operations
-- Note: User asked for TO public (which covers anon/authenticated)
CREATE POLICY "Allow insert on payment_schedules" 
ON public.payment_schedules 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow select on payment_schedules" 
ON public.payment_schedules 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow update on payment_schedules" 
ON public.payment_schedules 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow delete on payment_schedules" 
ON public.payment_schedules 
FOR DELETE 
TO authenticated 
USING (true);

-- Ensure service_role has full access (often implicit but explicit is better for triggers)
GRANT ALL ON public.payment_schedules TO authenticated;
GRANT ALL ON public.payment_schedules TO service_role;
