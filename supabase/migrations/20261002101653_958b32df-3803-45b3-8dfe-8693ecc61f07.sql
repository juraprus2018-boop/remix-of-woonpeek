REVOKE EXECUTE ON FUNCTION public.get_my_agency() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.agency_dashboard_stats(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_agency_visible(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_agencies() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_agency_event(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_agency_event(uuid, uuid, text) TO anon, authenticated;