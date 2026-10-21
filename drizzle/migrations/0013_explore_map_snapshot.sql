CREATE OR REPLACE FUNCTION public.explore_map_snapshot()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_array(
    id, title, price, listing_type, property_type, city, street, house_number,
    slug, address_slug, images[1], latitude, longitude, bedrooms,
    surface_area, source_site, provider_priority, created_at
  )), '[]'::jsonb)
  FROM public.properties
  WHERE status = 'actief' AND latitude IS NOT NULL AND longitude IS NOT NULL;
$$;
REVOKE ALL ON FUNCTION public.explore_map_snapshot() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.explore_map_snapshot() TO anon, authenticated, service_role;