CREATE TABLE public.property_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  reason text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'nieuw',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.property_reports TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.property_reports TO authenticated;
GRANT ALL ON public.property_reports TO service_role;
ALTER TABLE public.property_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Iedereen kan melden" ON public.property_reports FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'nieuw' AND reason IN ('verlopen','onjuiste_info') AND (message IS NULL OR length(message) <= 1000));
CREATE POLICY "Admins lezen meldingen" ON public.property_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins wijzigen meldingen" ON public.property_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins verwijderen meldingen" ON public.property_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));