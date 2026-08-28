CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_properties_city_trgm
  ON public.properties USING gin (city gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_properties_status_missing_geo
  ON public.properties (status)
  WHERE latitude IS NULL;

ANALYZE public.properties;