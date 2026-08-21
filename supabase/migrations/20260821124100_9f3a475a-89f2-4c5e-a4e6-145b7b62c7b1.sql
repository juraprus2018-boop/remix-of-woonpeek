-- Address-based, city-scoped URL slug + extra listing metadata
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS address_slug text,
  ADD COLUMN IF NOT EXISTS available_from date,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.build_address_slug(_street text, _house_number text, _postal_code text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  street_part text;
  nr_part text;
  pc_part text;
  s text;
BEGIN
  -- Feed streets often contain "Street, 1234AB, City"; keep only the street name
  street_part := split_part(coalesce(_street, ''), ',', 1);
  nr_part := coalesce(nullif(btrim(coalesce(_house_number, '')), '-'), '');
  pc_part := upper(regexp_replace(coalesce(_postal_code, ''), '\s', '', 'g'));

  s := lower(btrim(street_part));
  IF nr_part <> '' THEN
    s := s || '-' || lower(nr_part);
  ELSIF pc_part <> '' THEN
    s := s || '-' || lower(pc_part);
  END IF;

  s := translate(s, 'áàäâãéèëêíìïîóòöôõúùüûçñ', 'aaaaaeeeeiiiiooooouuuucn');
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := btrim(s, '-');
  RETURN nullif(s, '');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_property_address_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := public.build_address_slug(NEW.street, NEW.house_number, NEW.postal_code);
  IF base_slug IS NULL THEN
    base_slug := coalesce(public.build_address_slug(NEW.city, NULL, NEW.postal_code), 'woning') ;
  END IF;

  final_slug := base_slug;
  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.properties WHERE address_slug = final_slug AND id <> NEW.id
    );
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.address_slug := final_slug;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS address_slug_on_insert ON public.properties;
CREATE TRIGGER address_slug_on_insert
BEFORE INSERT ON public.properties
FOR EACH ROW
WHEN (NEW.address_slug IS NULL)
EXECUTE FUNCTION public.generate_property_address_slug();

DROP TRIGGER IF EXISTS address_slug_on_update ON public.properties;
CREATE TRIGGER address_slug_on_update
BEFORE UPDATE ON public.properties
FOR EACH ROW
WHEN (
  NEW.address_slug IS NULL
  OR NEW.street IS DISTINCT FROM OLD.street
  OR NEW.house_number IS DISTINCT FROM OLD.house_number
  OR NEW.postal_code IS DISTINCT FROM OLD.postal_code
)
EXECUTE FUNCTION public.generate_property_address_slug();

-- Backfill existing rows
DO $$
DECLARE
  r record;
  base_slug text;
  final_slug text;
  counter integer;
BEGIN
  FOR r IN SELECT id, street, house_number, postal_code, city FROM public.properties WHERE address_slug IS NULL ORDER BY created_at LOOP
    base_slug := coalesce(
      public.build_address_slug(r.street, r.house_number, r.postal_code),
      public.build_address_slug(r.city, NULL, r.postal_code),
      'woning'
    );
    final_slug := base_slug;
    counter := 0;
    WHILE EXISTS (SELECT 1 FROM public.properties WHERE address_slug = final_slug) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    UPDATE public.properties SET address_slug = final_slug WHERE id = r.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_address_slug ON public.properties(address_slug) WHERE address_slug IS NOT NULL;
