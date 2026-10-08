CREATE OR REPLACE FUNCTION public.admin_delete_agency(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;
  PERFORM 1 FROM public.agencies WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Makelaar niet gevonden' USING ERRCODE = 'P0002';
  END IF;
  UPDATE public.properties SET status = 'inactief' WHERE agency_id = _id;
  DELETE FROM public.agencies WHERE id = _id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_delete_agency(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_agency(uuid) TO authenticated;
COMMENT ON FUNCTION public.admin_delete_agency(uuid) IS 'Admin-only agency removal; preserves property history as inactive listings and leaves the user account intact.';