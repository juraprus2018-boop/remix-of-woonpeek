DROP POLICY IF EXISTS "Public can view scrapers" ON public.scrapers;

DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT TO anon, authenticated
WITH CHECK (length(session_id) BETWEEN 1 AND 128 AND length(page_url) BETWEEN 1 AND 2048
  AND (referrer IS NULL OR length(referrer) <= 2048) AND (user_agent IS NULL OR length(user_agent) <= 1024));

DROP POLICY IF EXISTS "Anyone can insert comments" ON public.property_comments;
CREATE POLICY "Anyone can insert comments" ON public.property_comments FOR INSERT TO anon, authenticated
WITH CHECK (is_approved = false AND length(btrim(name)) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(btrim(content)) BETWEEN 1 AND 5000);

DROP POLICY IF EXISTS "Anyone can insert makelaar leads" ON public.makelaar_leads;
CREATE POLICY "Anyone can insert makelaar leads" ON public.makelaar_leads FOR INSERT TO anon, authenticated
WITH CHECK (status = 'nieuw' AND length(btrim(kantoornaam)) BETWEEN 1 AND 200 AND length(btrim(contactpersoon)) BETWEEN 1 AND 200
  AND length(email) BETWEEN 3 AND 255 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (opmerking IS NULL OR length(opmerking) <= 5000) AND (feed_url IS NULL OR length(feed_url) <= 2048));

DROP POLICY IF EXISTS "Anyone can insert search queries" ON public.search_queries;
CREATE POLICY "Anyone can insert search queries" ON public.search_queries FOR INSERT TO anon, authenticated
WITH CHECK (count = 1 AND (query IS NULL OR length(query) <= 200) AND (city IS NULL OR length(city) <= 120));

DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.neighborhood_reviews;
CREATE POLICY "Anyone can insert reviews" ON public.neighborhood_reviews FOR INSERT TO anon, authenticated
WITH CHECK (is_approved = false AND rating BETWEEN 1 AND 5 AND length(btrim(name)) BETWEEN 1 AND 100
  AND (user_id IS NULL OR user_id = auth.uid())
  AND length(neighborhood) <= 200 AND length(city) <= 120
  AND coalesce(length(pros),0) <= 2000 AND coalesce(length(cons),0) <= 2000 AND coalesce(length(comment),0) <= 5000);

DROP POLICY IF EXISTS "Anyone can insert daisycon clicks" ON public.daisycon_clicks;
CREATE POLICY "Anyone can insert daisycon clicks" ON public.daisycon_clicks FOR INSERT TO anon, authenticated
WITH CHECK (length(source_url) BETWEEN 1 AND 2048 AND (page_url IS NULL OR length(page_url) <= 2048)
  AND (session_id IS NULL OR length(session_id) <= 128) AND (source_site IS NULL OR length(source_site) <= 200));