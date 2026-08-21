-- 1. profiles: no more public read
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.profiles FROM anon;

-- 2. property_comments: hide email column from public reads
REVOKE SELECT ON public.property_comments FROM anon, authenticated;
GRANT SELECT (id, property_id, name, content, is_approved, created_at)
  ON public.property_comments TO anon, authenticated;
GRANT SELECT ON public.property_comments TO service_role;

-- 3. site_settings: only public-safe feature flags readable publicly
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
CREATE POLICY "Public can view public feature flags"
ON public.site_settings FOR SELECT TO anon, authenticated
USING (key IN ('city_realtors_enabled'));

-- 4. storage: uploads must target own property folder / own avatar / admin paths
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Users can upload images to their own paths"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
    OR name LIKE 'avatars/' || auth.uid()::text || '%'
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 5. revoke EXECUTE on SECURITY DEFINER helpers that clients never need
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_ad_slots_updated_at() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;