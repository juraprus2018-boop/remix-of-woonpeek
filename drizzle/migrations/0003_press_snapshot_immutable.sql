CREATE OR REPLACE FUNCTION public.press_releases_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.data IS DISTINCT FROM OLD.data OR NEW.findings IS DISTINCT FROM OLD.findings OR NEW.chart IS DISTINCT FROM OLD.chart
     OR NEW.sample_size IS DISTINCT FROM OLD.sample_size OR NEW.reference_date IS DISTINCT FROM OLD.reference_date OR NEW.slug IS DISTINCT FROM OLD.slug THEN
    RAISE EXCEPTION 'Gepubliceerde cijfers zijn een vaste momentopname en kunnen niet worden gewijzigd';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER press_releases_immutable BEFORE UPDATE ON public.press_releases FOR EACH ROW EXECUTE FUNCTION public.press_releases_immutable();