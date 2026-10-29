DROP POLICY IF EXISTS "Public reads visible agencies" ON public.agencies;
CREATE POLICY "Anon reads visible agencies" ON public.agencies FOR SELECT TO anon USING (is_visible);
CREATE POLICY "Users read visible own or admin agencies" ON public.agencies FOR SELECT TO authenticated USING (is_visible OR owner_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));