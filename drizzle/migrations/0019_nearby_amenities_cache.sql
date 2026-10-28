CREATE TABLE public.nearby_amenities_cache (
  cache_key text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nearby_amenities_cache TO anon, authenticated;
GRANT ALL ON public.nearby_amenities_cache TO service_role;
ALTER TABLE public.nearby_amenities_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read amenity cache" ON public.nearby_amenities_cache FOR SELECT TO anon, authenticated USING (true);