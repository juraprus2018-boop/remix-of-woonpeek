CREATE TABLE public.daisycon_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid REFERENCES public.daisycon_feeds(id) ON DELETE CASCADE,
  program_id integer NOT NULL,
  media_id integer NOT NULL,
  material_id text NOT NULL,
  advertiser_name text,
  name text,
  width integer,
  height integer,
  image_url text NOT NULL,
  click_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, media_id, material_id)
);
GRANT SELECT ON public.daisycon_banners TO anon, authenticated;
GRANT ALL ON public.daisycon_banners TO service_role;
ALTER TABLE public.daisycon_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active banners" ON public.daisycon_banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins view all banners" ON public.daisycon_banners FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_daisycon_banners_updated_at BEFORE UPDATE ON public.daisycon_banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();