CREATE TABLE public.press_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('lokaal','landelijk','handmatig')),
  topic text,
  city_slug text,
  city_name text,
  title text NOT NULL,
  summary text NOT NULL,
  body text,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  chart jsonb,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  methodology text NOT NULL,
  reference_date date NOT NULL,
  sample_size integer NOT NULL DEFAULT 0,
  fingerprint text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')),
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.press_releases TO anon, authenticated;
GRANT UPDATE, DELETE ON public.press_releases TO authenticated;
GRANT ALL ON public.press_releases TO service_role;
ALTER TABLE public.press_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published press" ON public.press_releases FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update press" ON public.press_releases FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete press" ON public.press_releases FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX press_releases_pub_idx ON public.press_releases (published_at DESC);
CREATE INDEX press_releases_city_idx ON public.press_releases (kind, city_slug, published_at DESC);

CREATE TABLE public.press_generation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  status text NOT NULL,
  message text,
  release_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.press_generation_log TO authenticated;
GRANT ALL ON public.press_generation_log TO service_role;
ALTER TABLE public.press_generation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read press log" ON public.press_generation_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));