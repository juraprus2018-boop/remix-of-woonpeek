ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS feed_priority integer
  GENERATED ALWAYS AS (CASE WHEN lower(coalesce(source_site,'')) IN ('huurwoningen.nl','huurwoningen') THEN 0 ELSE 1 END) STORED;

CREATE INDEX IF NOT EXISTS properties_feed_priority_created_idx
  ON public.properties (feed_priority, created_at DESC);