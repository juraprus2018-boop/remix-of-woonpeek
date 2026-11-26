CREATE TABLE public.property_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  price numeric,
  status public.property_status,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.property_price_history TO anon, authenticated;
GRANT ALL ON public.property_price_history TO service_role;
ALTER TABLE public.property_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public price history read" ON public.property_price_history FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX property_price_history_prop_idx ON public.property_price_history (property_id, changed_at);

CREATE OR REPLACE FUNCTION public.log_property_price_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.price IS DISTINCT FROM OLD.price OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.property_price_history (property_id, price, status) VALUES (NEW.id, NEW.price, NEW.status);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER properties_price_history
AFTER INSERT OR UPDATE OF price, status ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.log_property_price_change();