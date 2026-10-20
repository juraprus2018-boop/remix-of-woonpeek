CREATE TABLE public.facebook_video_jobs (
 day date PRIMARY KEY,
 property_id uuid REFERENCES public.properties(id),
 status text NOT NULL DEFAULT 'pending',
 video_id text,
 render_id text,
 video_url text,
 permalink_url text,
 details jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.facebook_video_jobs TO authenticated;
GRANT ALL ON public.facebook_video_jobs TO service_role;
ALTER TABLE public.facebook_video_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read video jobs" ON public.facebook_video_jobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
COMMENT ON TABLE public.facebook_video_jobs IS 'One persistent daily Facebook video job; accepted uploads are not confirmed publications.';