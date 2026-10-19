-- Additive payload preservation; unknown types must not become apartments.
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS source_raw jsonb;
ALTER TABLE public.properties ALTER COLUMN property_type DROP NOT NULL;
-- Existing table-level privileges continue to apply to the new nullable column.
GRANT SELECT ON public.properties TO anon, authenticated;
GRANT ALL ON public.properties TO service_role;
COMMENT ON COLUMN public.properties.source_raw IS 'Original import item (JSON object, or {xml: original XML item}); never inferred from description.';