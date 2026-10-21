CREATE OR REPLACE FUNCTION public.sync_renthunter_batch(_rows jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE affected integer;
BEGIN
 IF jsonb_typeof(_rows) <> 'array' OR jsonb_array_length(_rows) > 250 THEN RAISE EXCEPTION 'Invalid Renthunter batch'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(_rows) x WHERE x->>'source_site' IS DISTINCT FROM 'Renthunter' OR x->>'source_url' NOT LIKE 'https://renthunter.nl/rental/%?via=woonaanbod') THEN RAISE EXCEPTION 'Invalid Renthunter source'; END IF;
 INSERT INTO public.properties (id,user_id,title,description,property_type,listing_type,price,surface_area,bedrooms,bathrooms,build_year,energy_label,street,house_number,postal_code,city,neighborhood,latitude,longitude,images,status,source_site,source_url,source_raw,available_from,last_checked_at,created_at)
 SELECT coalesce(r.id,gen_random_uuid()),'dbf1773b-5120-458f-8719-590b9fa4c787'::uuid,r.title,r.description,r.property_type,'huur'::public.listing_type,r.price,r.surface_area,r.bedrooms,r.bathrooms,r.build_year,r.energy_label,r.street,r.house_number,r.postal_code,r.city,r.neighborhood,r.latitude,r.longitude,r.images,r.status,'Renthunter',r.source_url,r.source_raw,r.available_from,r.last_checked_at,coalesce(r.created_at,now())
 FROM jsonb_populate_recordset(NULL::public.properties,_rows) r
 ON CONFLICT (id) DO UPDATE SET title=excluded.title,description=excluded.description,property_type=excluded.property_type,price=excluded.price,surface_area=excluded.surface_area,bedrooms=excluded.bedrooms,bathrooms=excluded.bathrooms,build_year=excluded.build_year,energy_label=excluded.energy_label,street=excluded.street,house_number=excluded.house_number,postal_code=excluded.postal_code,city=excluded.city,neighborhood=excluded.neighborhood,latitude=excluded.latitude,longitude=excluded.longitude,images=excluded.images,status=excluded.status,source_url=excluded.source_url,source_raw=excluded.source_raw,available_from=excluded.available_from,last_checked_at=excluded.last_checked_at,updated_at=now()
 WHERE properties.source_site='Renthunter';
 GET DIAGNOSTICS affected = ROW_COUNT;
 RETURN affected;
END; $$;
REVOKE ALL ON FUNCTION public.sync_renthunter_batch(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_renthunter_batch(jsonb) TO service_role;