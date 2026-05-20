
CREATE TABLE IF NOT EXISTS public.translations_cache (
  source_hash text NOT NULL,
  lang text NOT NULL,
  source_text text NOT NULL,
  translated_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_hash, lang)
);
ALTER TABLE public.translations_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read translations" ON public.translations_cache FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS translations_cache_lang_idx ON public.translations_cache(lang);
