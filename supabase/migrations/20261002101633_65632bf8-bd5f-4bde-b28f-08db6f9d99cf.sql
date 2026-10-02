CREATE TABLE public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  city text,
  website text,
  phone text,
  email text,
  description text,
  logo_url text,
  feed_type text NOT NULL DEFAULT 'handmatig',
  feed_url text,
  feed_last_sync_at timestamptz,
  feed_last_status text,
  feed_last_message text,
  feed_last_count integer,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.validate_agency() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.feed_type NOT IN ('xml','json','realworks','handmatig') THEN RAISE EXCEPTION 'invalid feed_type'; END IF;
  IF NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN RAISE EXCEPTION 'invalid slug'; END IF;
  IF length(NEW.name) < 2 OR length(NEW.name) > 120 THEN RAISE EXCEPTION 'invalid name'; END IF;
  IF NEW.feed_url IS NOT NULL AND NEW.feed_url !~ '^https?://' THEN RAISE EXCEPTION 'invalid feed_url'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER agencies_validate BEFORE INSERT OR UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.validate_agency();
CREATE TRIGGER agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT (id, slug, name, city, website, phone, email, description, logo_url, is_visible, created_at) ON public.agencies TO anon, authenticated;
GRANT INSERT (owner_user_id, slug, name, city, website, phone, email, description, logo_url, feed_type, feed_url) ON public.agencies TO authenticated;
GRANT UPDATE (name, city, website, phone, email, description, logo_url, feed_type, feed_url) ON public.agencies TO authenticated;
GRANT ALL ON public.agencies TO service_role;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible agencies" ON public.agencies FOR SELECT USING (is_visible OR owner_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner creates own agency" ON public.agencies FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Owner updates own agency" ON public.agencies FOR UPDATE TO authenticated USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());

ALTER TABLE public.properties ADD COLUMN agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL;
CREATE INDEX properties_agency_id_idx ON public.properties(agency_id) WHERE agency_id IS NOT NULL;

CREATE TABLE public.agency_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX agency_events_agency_idx ON public.agency_events(agency_id, created_at);
GRANT SELECT ON public.agency_events TO authenticated;
GRANT ALL ON public.agency_events TO service_role;
ALTER TABLE public.agency_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads own events" ON public.agency_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.log_agency_event(_agency_id uuid, _property_id uuid, _event_type text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _event_type NOT IN ('view','click') THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM agencies WHERE id = _agency_id AND is_visible) THEN RETURN; END IF;
  INSERT INTO agency_events (agency_id, property_id, event_type) VALUES (_agency_id, _property_id, _event_type);
END $$;
GRANT EXECUTE ON FUNCTION public.log_agency_event(uuid, uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_agency()
RETURNS SETOF public.agencies LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM agencies WHERE owner_user_id = auth.uid() LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_agency() TO authenticated;

CREATE OR REPLACE FUNCTION public.agency_dashboard_stats(_days integer DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE a agencies; since timestamptz := now() - make_interval(days => greatest(_days,1));
BEGIN
  SELECT * INTO a FROM agencies WHERE owner_user_id = auth.uid() LIMIT 1;
  IF a.id IS NULL THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'active', (SELECT count(*) FROM properties WHERE agency_id = a.id AND status = 'actief'),
    'views', (SELECT count(*) FROM agency_events WHERE agency_id = a.id AND event_type='view' AND created_at >= since),
    'clicks', (SELECT count(*) FROM agency_events WHERE agency_id = a.id AND event_type='click' AND created_at >= since),
    'leads', (SELECT count(*) FROM property_comments c JOIN properties p ON p.id = c.property_id WHERE p.agency_id = a.id AND c.created_at >= since)
  );
END $$;
GRANT EXECUTE ON FUNCTION public.agency_dashboard_stats(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_agency_visible(_id uuid, _visible boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE agencies SET is_visible = _visible WHERE id = _id;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_set_agency_visible(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_agencies()
RETURNS TABLE(id uuid, slug text, name text, city text, email text, feed_type text, feed_url text, feed_last_sync_at timestamptz, feed_last_status text, feed_last_message text, is_visible boolean, created_at timestamptz, active_count bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN QUERY SELECT a.id, a.slug, a.name, a.city, a.email, a.feed_type, a.feed_url, a.feed_last_sync_at, a.feed_last_status, a.feed_last_message, a.is_visible, a.created_at,
    (SELECT count(*) FROM properties p WHERE p.agency_id = a.id AND p.status='actief')
  FROM agencies a ORDER BY a.created_at DESC;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_list_agencies() TO authenticated;

CREATE POLICY "Agency owners upload logo" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images' AND (storage.foldername(name))[1] = 'agencies' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "Agency owners update logo" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = 'agencies' AND (storage.foldername(name))[2] = auth.uid()::text);