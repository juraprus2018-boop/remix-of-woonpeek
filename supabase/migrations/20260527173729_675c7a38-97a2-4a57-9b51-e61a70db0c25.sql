
ALTER TABLE public.favorites
  ADD COLUMN IF NOT EXISTS notify_changes boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_price_seen numeric,
  ADD COLUMN IF NOT EXISTS last_status_seen text,
  ADD COLUMN IF NOT EXISTS last_notified_at timestamptz;

-- Allow users to update their own favorite (for toggling notify_changes)
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorites;
CREATE POLICY "Users can update their own favorites"
ON public.favorites
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

GRANT UPDATE ON public.favorites TO authenticated;

-- Index for the cron job
CREATE INDEX IF NOT EXISTS idx_favorites_notify ON public.favorites (notify_changes) WHERE notify_changes = true;
