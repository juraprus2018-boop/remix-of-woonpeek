CREATE OR REPLACE FUNCTION public.search_properties_round_robin(_filters jsonb DEFAULT '{}'::jsonb, _offset integer DEFAULT 0, _limit integer DEFAULT 12, _sort text DEFAULT 'newest') RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
WITH filtered AS MATERIALIZED (
 SELECT p.id, p.price, p.created_at, p.surface_area,
 CASE WHEN lower(trim(p.source_site)) IN ('huurzone','huurzone.nl') THEN '0' WHEN lower(trim(p.source_site)) IN ('huurwoningen','huurwoningen.nl') THEN '1' WHEN lower(trim(p.source_site)) LIKE '%renthunter%' THEN '2' ELSE '3:' || coalesce(lower(trim(p.source_site)), '') END AS provider
 FROM public.properties p
 WHERE (CASE WHEN coalesce((_filters->>'includeInactive')::boolean, false) THEN p.status IN ('actief','inactief','verhuurd','verkocht') ELSE p.status = 'actief' END)
 AND (nullif(trim(_filters->>'city'),'') IS NULL OR CASE WHEN trim(_filters->>'city') ~ '^\d' THEN p.postal_code ILIKE '%' || trim(_filters->>'city') || '%' ELSE p.city ILIKE '%' || trim(_filters->>'city') || '%' END)
 AND (_filters->>'exactCity' IS NULL OR p.city = _filters->>'exactCity')
 AND (_filters->>'propertyType' IS NULL OR p.property_type::text = _filters->>'propertyType')
 AND (coalesce(jsonb_array_length(_filters->'propertyTypes'),0) = 0 OR p.property_type::text IN (SELECT jsonb_array_elements_text(_filters->'propertyTypes')))
 AND (_filters->>'listingType' IS NULL OR p.listing_type::text = _filters->>'listingType')
 AND (coalesce((_filters->>'minPrice')::numeric,0) = 0 OR p.price >= (_filters->>'minPrice')::numeric)
 AND (coalesce((_filters->>'maxPrice')::numeric,0) = 0 OR p.price <= (_filters->>'maxPrice')::numeric)
 AND (coalesce((_filters->>'minSurface')::integer,0) = 0 OR p.surface_area >= (_filters->>'minSurface')::integer)
 AND (coalesce((_filters->>'minBedrooms')::integer,0) = 0 OR p.bedrooms >= (_filters->>'minBedrooms')::integer)
 AND (_filters->>'sourceSite' IS NULL OR p.source_site = _filters->>'sourceSite')
 AND (_filters->>'sourcePattern' IS NULL OR p.source_site ILIKE _filters->>'sourcePattern')
 AND (_filters->>'textMatch' IS NULL OR p.title ILIKE '%' || regexp_replace(_filters->>'textMatch','[%,()]','','g') || '%' OR p.description ILIKE '%' || regexp_replace(_filters->>'textMatch','[%,()]','','g') || '%')
 AND (_filters->>'excludeId' IS NULL OR p.id::text <> _filters->>'excludeId')
 AND (_filters->>'agencyId' IS NULL OR p.agency_id::text = _filters->>'agencyId')
 AND (_filters->>'neighborhood' IS NULL OR p.neighborhood ILIKE '%' || (_filters->>'neighborhood') || '%')
 AND (_filters->>'createdAfter' IS NULL OR p.created_at >= (_filters->>'createdAfter')::timestamptz)
 AND (_filters->>'createdBefore' IS NULL OR p.created_at < (_filters->>'createdBefore')::timestamptz)
 AND (NOT coalesce((_filters->>'positiveSurface')::boolean,false) OR p.surface_area > 0)
 AND (NOT coalesce((_filters->>'positivePrice')::boolean,false) OR p.price > 0)
), ranked AS (
 SELECT id, provider, row_number() OVER (PARTITION BY provider ORDER BY
 CASE WHEN _sort = 'price_asc' THEN price END ASC NULLS LAST,
 CASE WHEN _sort = 'price_desc' THEN price END DESC NULLS LAST,
 CASE WHEN _sort = 'surface_desc' THEN surface_area END DESC NULLS LAST,
 created_at DESC, id ASC) AS turn FROM filtered
), page AS (
 SELECT * FROM ranked ORDER BY turn, provider COLLATE "C" LIMIT greatest(1,least(_limit,1000)) OFFSET greatest(_offset,0)
)
SELECT jsonb_build_object('totalCount',(SELECT count(*) FROM filtered),'properties',coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY page.turn,page.provider COLLATE "C") FROM page JOIN public.properties p ON p.id = page.id),'[]'::jsonb));
$$;
REVOKE ALL ON FUNCTION public.search_properties_round_robin(jsonb,integer,integer,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_properties_round_robin(jsonb,integer,integer,text) TO anon, authenticated, service_role;
UPDATE public.properties SET provider_priority = 0 WHERE lower(trim(source_site)) IN ('huurzone','huurzone.nl') AND provider_priority IS DISTINCT FROM 0;
UPDATE public.properties SET provider_priority = 1 WHERE lower(trim(source_site)) IN ('huurwoningen','huurwoningen.nl') AND provider_priority IS DISTINCT FROM 1;
