DROP POLICY IF EXISTS "Public can read amenity cache" ON public.nearby_amenities_cache;
REVOKE SELECT ON TABLE public.nearby_amenities_cache FROM anon, authenticated;