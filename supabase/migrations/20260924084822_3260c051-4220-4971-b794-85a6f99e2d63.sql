DROP INDEX IF EXISTS public.properties_feed_priority_created_idx;

ALTER TABLE public.properties DROP COLUMN IF EXISTS feed_priority;

ALTER TABLE public.properties
  ADD COLUMN feed_priority integer GENERATED ALWAYS AS (
    CASE
      WHEN lower(coalesce(source_site, '')) = ANY (ARRAY['huurwoningen.nl','huurwoningen']) THEN 0
      WHEN lower(coalesce(source_site, '')) = ANY (ARRAY['huurzone.nl','huurzone','kamernet','kamernet.nl','directwonen.nl','directwonen','huurstunt','huurstunt.nl']) THEN 1
      WHEN source_site IS NULL THEN 4
      ELSE 5
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS properties_feed_priority_created_idx
  ON public.properties (feed_priority, created_at DESC);