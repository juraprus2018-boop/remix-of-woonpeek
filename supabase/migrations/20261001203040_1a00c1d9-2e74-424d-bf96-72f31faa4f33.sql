CREATE INDEX IF NOT EXISTS idx_properties_postal_code_trgm ON public.properties USING gin (postal_code extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_title_trgm ON public.properties USING gin (title extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_description_trgm ON public.properties USING gin (description extensions.gin_trgm_ops);