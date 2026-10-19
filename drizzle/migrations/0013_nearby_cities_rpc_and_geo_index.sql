CREATE INDEX IF NOT EXISTS properties_active_geo_idx
  ON public.properties (latitude, longitude) INCLUDE (city)
  WHERE status = 'actief' AND latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS properties_active_type_lower_city_idx
  ON public.properties (listing_type, lower(city))
  WHERE status = 'actief';

CREATE OR REPLACE FUNCTION public.nearby_cities(p_city text, p_limit int DEFAULT 12)
RETURNS TABLE(city text, listing_count bigint, km int)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  WITH center AS (
    SELECT avg(latitude)::float8 AS lat, avg(longitude)::float8 AS lng
    FROM (SELECT latitude, longitude FROM public.properties
          WHERE status = 'actief' AND city ILIKE p_city
            AND latitude IS NOT NULL AND longitude IS NOT NULL LIMIT 50) s
  ), agg AS (
    SELECT trim(p.city) AS city, count(*) AS n,
           avg(p.latitude)::float8 AS lat, avg(p.longitude)::float8 AS lng
    FROM public.properties p, center c
    WHERE c.lat IS NOT NULL AND p.status = 'actief'
      AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
      AND p.latitude BETWEEN c.lat - 0.32 AND c.lat + 0.32
      AND p.longitude BETWEEN c.lng - 0.5 AND c.lng + 0.5
      AND coalesce(trim(p.city), '') <> '' AND lower(trim(p.city)) <> lower(trim(p_city))
    GROUP BY trim(p.city)
  )
  SELECT a.city, a.n,
    round(6371 * 2 * asin(sqrt(power(sin(radians(a.lat - c.lat) / 2), 2)
      + cos(radians(c.lat)) * cos(radians(a.lat)) * power(sin(radians(a.lng - c.lng) / 2), 2))))::int AS km
  FROM agg a, center c
  ORDER BY km ASC
  LIMIT greatest(1, least(p_limit, 50));
$$;

GRANT EXECUTE ON FUNCTION public.nearby_cities(text, int) TO anon, authenticated, service_role;