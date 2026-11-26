CREATE TABLE public.moving_plans (
  user_id uuid PRIMARY KEY,
  moving_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.moving_plans TO authenticated;
GRANT ALL ON public.moving_plans TO service_role;
ALTER TABLE public.moving_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own plan all" ON public.moving_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.moving_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  days_before integer NOT NULL DEFAULT 0,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.moving_tasks TO authenticated;
GRANT ALL ON public.moving_tasks TO service_role;
ALTER TABLE public.moving_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own tasks all" ON public.moving_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX moving_tasks_user_idx ON public.moving_tasks (user_id, days_before DESC);