CREATE TABLE public.agency_claim_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_name text NOT NULL CHECK (char_length(office_name) BETWEEN 2 AND 150),
  city text CHECK (city IS NULL OR char_length(city) <= 100),
  contact_name text CHECK (contact_name IS NULL OR char_length(contact_name) <= 100),
  email text NOT NULL CHECK (char_length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 30),
  website text CHECK (website IS NULL OR char_length(website) <= 255),
  status text NOT NULL DEFAULT 'nieuw' CHECK (status IN ('nieuw','benaderd','geclaimd','afgewezen')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.agency_claim_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.agency_claim_requests TO authenticated;
GRANT ALL ON public.agency_claim_requests TO service_role;
ALTER TABLE public.agency_claim_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit claim with new status" ON public.agency_claim_requests FOR INSERT TO anon, authenticated WITH CHECK (status = 'nieuw');
CREATE POLICY "Admins read claims" ON public.agency_claim_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update claims" ON public.agency_claim_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete claims" ON public.agency_claim_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));