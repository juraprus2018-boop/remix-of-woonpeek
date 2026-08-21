REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.touch_ad_slots_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_city_counts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_home_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_search_query(text, text, text, text, numeric, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.market_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.market_stats_extra() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_city_counts() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_home_stats() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_search_query(text, text, text, text, numeric, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.market_stats() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.market_stats_extra() TO anon, authenticated, service_role;