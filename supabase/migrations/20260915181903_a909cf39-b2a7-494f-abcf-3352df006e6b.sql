CREATE TABLE public.blog_generation_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status text NOT NULL,
  message text,
  slug text,
  trigger text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_generation_log TO authenticated;
GRANT ALL ON public.blog_generation_log TO service_role;

ALTER TABLE public.blog_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view blog generation log"
ON public.blog_generation_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_blog_generation_log_created_at ON public.blog_generation_log (created_at DESC);