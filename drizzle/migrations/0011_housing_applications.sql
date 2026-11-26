CREATE TABLE public.housing_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid,
  title text NOT NULL,
  url text,
  status text NOT NULL DEFAULT 'gereageerd' CHECK (status IN ('interesse','gereageerd','bezichtiging','afgewezen','aangeboden','getekend')),
  viewing_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.housing_applications TO authenticated;
GRANT ALL ON public.housing_applications TO service_role;
ALTER TABLE public.housing_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own applications select" ON public.housing_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own applications insert" ON public.housing_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own applications update" ON public.housing_applications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own applications delete" ON public.housing_applications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX housing_applications_user_idx ON public.housing_applications (user_id, created_at DESC);