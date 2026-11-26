CREATE TABLE public.tenant_profiles (
  user_id uuid PRIMARY KEY,
  household_size integer CHECK (household_size BETWEEN 1 AND 20),
  monthly_income numeric CHECK (monthly_income >= 0),
  employment text,
  pets boolean NOT NULL DEFAULT false,
  smoker boolean NOT NULL DEFAULT false,
  move_in_from date,
  intro text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_profiles TO authenticated;
GRANT ALL ON public.tenant_profiles TO service_role;
ALTER TABLE public.tenant_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own tenant profile all" ON public.tenant_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);