DROP POLICY IF EXISTS "Public price history read" ON public.property_price_history;
CREATE POLICY "Price history readable for listed properties" ON public.property_price_history
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_price_history.property_id));