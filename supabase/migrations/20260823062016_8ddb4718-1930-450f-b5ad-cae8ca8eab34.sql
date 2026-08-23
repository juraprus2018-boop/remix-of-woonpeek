CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.cron_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO private.cron_config (id, secret)
VALUES (true, replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
ON CONFLICT (id) DO NOTHING;

ALTER TABLE private.cron_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.cron_config FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_cron_secret(_secret text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1 FROM private.cron_config
    WHERE _secret IS NOT NULL AND length(_secret) > 20 AND secret = _secret
  );
$$;

REVOKE ALL ON FUNCTION public.verify_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_cron_secret(text) TO service_role;