CREATE TABLE public.cbs_stats_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_slug text NOT NULL UNIQUE,
  city_name text NOT NULL,
  region_code text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cbs_stats_cache TO anon;
GRANT SELECT ON public.cbs_stats_cache TO authenticated;
GRANT ALL ON public.cbs_stats_cache TO service_role;
ALTER TABLE public.cbs_stats_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view CBS stats" ON public.cbs_stats_cache FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages CBS stats" ON public.cbs_stats_cache FOR ALL TO public USING (auth.role() = 'service_role');
CREATE INDEX idx_cbs_stats_city_slug ON public.cbs_stats_cache(city_slug);