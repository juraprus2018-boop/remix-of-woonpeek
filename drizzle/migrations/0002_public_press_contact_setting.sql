CREATE POLICY "Public can view press contact" ON public.site_settings FOR SELECT USING (key = 'press_contact');
GRANT SELECT ON public.site_settings TO anon;
INSERT INTO public.site_settings (key, value, description) VALUES ('press_contact', '{"name":"Persvoorlichting Woonaanbod NL","email":"info@woonaanbod-nl.nl","phone":""}'::jsonb, 'Perscontact op /pers') ON CONFLICT (key) DO NOTHING;