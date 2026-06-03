
CREATE TABLE public.rent_index_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug text NOT NULL,
  city_name text NOT NULL,
  snapshot_month date NOT NULL,
  avg_rent numeric,
  median_rent numeric,
  min_rent numeric,
  max_rent numeric,
  sample_size integer NOT NULL DEFAULT 0,
  avg_price_per_m2 numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_slug, snapshot_month)
);

GRANT SELECT ON public.rent_index_snapshots TO anon, authenticated;
GRANT ALL ON public.rent_index_snapshots TO service_role;
ALTER TABLE public.rent_index_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rent index" ON public.rent_index_snapshots
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage rent index" ON public.rent_index_snapshots
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role full access rent index" ON public.rent_index_snapshots
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_rent_index_city_month ON public.rent_index_snapshots(city_slug, snapshot_month DESC);

CREATE TABLE public.livability_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  city text,
  postal_code text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.livability_cache TO anon, authenticated;
GRANT ALL ON public.livability_cache TO service_role;
ALTER TABLE public.livability_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view livability" ON public.livability_cache
  FOR SELECT USING (true);
CREATE POLICY "Service role manages livability" ON public.livability_cache
  FOR ALL USING (auth.role() = 'service_role');
