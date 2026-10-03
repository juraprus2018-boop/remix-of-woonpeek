DROP POLICY "Public reads published press" ON public.press_releases;
CREATE POLICY "Anyone reads published press" ON public.press_releases FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read all press" ON public.press_releases FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));