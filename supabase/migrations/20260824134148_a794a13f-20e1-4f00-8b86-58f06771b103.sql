ALTER TABLE public.daily_alert_subscribers
  ADD COLUMN IF NOT EXISTS listing_type text,
  ADD COLUMN IF NOT EXISTS property_type text,
  ADD COLUMN IF NOT EXISTS min_price numeric,
  ADD COLUMN IF NOT EXISTS max_price numeric,
  ADD COLUMN IF NOT EXISTS min_rooms integer,
  ADD COLUMN IF NOT EXISTS search_label text,
  ADD COLUMN IF NOT EXISTS filter_key text NOT NULL DEFAULT '';

ALTER TABLE public.daily_alert_subscribers DROP CONSTRAINT IF EXISTS daily_alert_subscribers_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS daily_alert_subscribers_email_filter_key
  ON public.daily_alert_subscribers (email, filter_key);