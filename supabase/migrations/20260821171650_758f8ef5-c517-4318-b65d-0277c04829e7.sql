CREATE OR REPLACE FUNCTION public.admin_list_property_comments(_filter text DEFAULT 'all')
RETURNS TABLE(
  id uuid,
  property_id uuid,
  name text,
  email text,
  content text,
  is_approved boolean,
  created_at timestamptz,
  property_title text,
  property_slug text,
  property_city text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT c.id, c.property_id, c.name, c.email, c.content, c.is_approved, c.created_at,
         p.title, p.slug, p.city
  FROM public.property_comments c
  LEFT JOIN public.properties p ON p.id = c.property_id
  WHERE (_filter = 'all')
     OR (_filter = 'pending' AND c.is_approved = false)
     OR (_filter = 'approved' AND c.is_approved = true)
  ORDER BY c.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_property_comments(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_property_comments(text) TO authenticated, service_role;