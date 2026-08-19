-- Force align sales table schema with the required logic
-- and resolve type mismatches in the auto-generated types

ALTER TABLE public.sales DROP COLUMN IF EXISTS agency_id;
ALTER TABLE public.sales DROP COLUMN IF EXISTS down_payment_amount;
ALTER TABLE public.sales DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.sales DROP COLUMN IF EXISTS signed_at;

-- Add missing columns or ensure they exist with correct types
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS balance NUMERIC(15, 2) DEFAULT 0 NOT NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS down_payment NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS sale_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS final_price NUMERIC(15, 2);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15, 2) DEFAULT 0;

-- Correct enum usage
-- Note: Supabase types might be lagging or cached. We use the existing sale_status enum values.
