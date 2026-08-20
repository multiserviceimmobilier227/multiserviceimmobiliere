
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Populate existing users into profiles
INSERT INTO public.profiles (id, full_name)
SELECT id, raw_user_meta_data->>'full_name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Update the view to use profiles instead of auth.users
CREATE OR REPLACE VIEW public.v_commercial_performance_detailed AS
SELECT 
    p.id AS agent_id,
    u.email AS agent_email,
    COALESCE(p.full_name, u.email) AS agent_name,
    s.agency_id,
    a.name AS agency_name,
    count(s.id) AS total_sales,
    sum(COALESCE(s.final_price, s.total_price)) AS total_value,
    sum(s.balance) AS total_balance,
    sum(COALESCE(s.final_price, s.total_price) - COALESCE(s.balance, 0)) AS collected_amount,
    count(s.id) FILTER (WHERE s.balance > 0) AS active_sales,
    s.sale_date
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
LEFT JOIN public.sales s ON p.id = s.prepared_by_id
LEFT JOIN public.agences a ON s.agency_id = a.id
GROUP BY p.id, u.email, p.full_name, s.agency_id, a.name, s.sale_date;

GRANT SELECT ON public.v_commercial_performance_detailed TO authenticated;
GRANT SELECT ON public.v_commercial_performance_detailed TO service_role;
