CREATE OR REPLACE FUNCTION public.deactivate_duplicate_properties()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  WITH ranked AS (
    SELECT id, row_number() OVER (
      PARTITION BY lower(trim(street)), lower(regexp_replace(house_number,'\s','','g')),
                   upper(replace(postal_code,' ','')), listing_type
      ORDER BY coalesce(feed_priority,999), created_at DESC, id) rn
    FROM properties
    WHERE status='actief' AND coalesce(trim(street),'')<>'' AND coalesce(trim(house_number),'')<>''
      AND coalesce(trim(postal_code),'')<>''
  )
  UPDATE properties p SET status='inactief', updated_at=now()
  FROM ranked r WHERE p.id=r.id AND r.rn>1;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.deactivate_duplicate_properties() FROM public, anon, authenticated;
SELECT cron.schedule('dedupe-properties-daily','30 4 * * *','SELECT public.deactivate_duplicate_properties()');