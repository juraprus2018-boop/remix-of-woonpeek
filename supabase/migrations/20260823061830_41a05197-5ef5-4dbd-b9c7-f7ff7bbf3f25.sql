-- 1) property_comments: keep commenter email out of public reach
REVOKE SELECT ON public.property_comments FROM anon, authenticated;
GRANT SELECT (id, property_id, name, content, is_approved, created_at) ON public.property_comments TO anon, authenticated;
GRANT INSERT (property_id, name, email, content) ON public.property_comments TO anon, authenticated;
GRANT ALL ON public.property_comments TO service_role;

DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.property_comments;
CREATE POLICY "Anyone can view approved comments"
ON public.property_comments
FOR SELECT
TO anon, authenticated
USING (is_approved = true);

-- 2) Storage: strict avatar ownership scoping (avatars/<uid>.<ext>)
DROP POLICY IF EXISTS "Users can upload images to their own paths" ON storage.objects;
CREATE POLICY "Users can upload images to their own paths"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id::text = (storage.foldername(storage.objects.name))[1]
        AND p.user_id = auth.uid()
    )
    OR storage.objects.name ~ ('^avatars/' || auth.uid()::text || '\.[A-Za-z0-9]+$')
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 3) SECURITY DEFINER functions that clients must never call directly
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_ad_slots_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_list_property_comments(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_property_comments(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.touch_ad_slots_updated_at() TO service_role;