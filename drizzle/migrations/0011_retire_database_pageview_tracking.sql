CREATE OR REPLACE FUNCTION public.ignore_retired_traffic_insert() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN RETURN NULL; END; $$;
CREATE TRIGGER ignore_retired_page_views BEFORE INSERT ON public.page_views FOR EACH ROW EXECUTE FUNCTION public.ignore_retired_traffic_insert();
CREATE TRIGGER ignore_retired_traffic_daily_page BEFORE INSERT ON public.traffic_daily_page FOR EACH ROW EXECUTE FUNCTION public.ignore_retired_traffic_insert();
CREATE TRIGGER ignore_retired_traffic_daily_source BEFORE INSERT ON public.traffic_daily_source FOR EACH ROW EXECUTE FUNCTION public.ignore_retired_traffic_insert();
CREATE OR REPLACE FUNCTION public.rollup_traffic_daily(days_back integer DEFAULT 2) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RETURN; END; $$;
COMMENT ON TABLE public.page_views IS 'DEPRECATED: database pageview tracking disabled at owner request; legacy inserts are ignored.';
COMMENT ON TABLE public.traffic_daily_page IS 'DEPRECATED: visitor statistics retired at owner request; legacy inserts are ignored.';
COMMENT ON TABLE public.traffic_daily_source IS 'DEPRECATED: visitor statistics retired at owner request; legacy inserts are ignored.';
COMMENT ON FUNCTION public.rollup_traffic_daily(integer) IS 'DEPRECATED: no-op for compatibility with legacy schedules; no traffic reads or writes.';