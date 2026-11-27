-- Regression test: temporary amenity storage is not directly readable by visitors.
-- A failing access rule raises division_by_zero instead of silently passing.
SELECT 1 / CASE WHEN NOT has_table_privilege(
  'anon', 'public.nearby_amenities_cache', 'SELECT'
) THEN 1 ELSE 0 END AS anonymous_read_blocked;

SELECT 1 / CASE WHEN NOT has_table_privilege(
  'authenticated', 'public.nearby_amenities_cache', 'SELECT'
) THEN 1 ELSE 0 END AS signed_in_read_blocked;

SELECT 1 / CASE WHEN NOT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'nearby_amenities_cache'
    AND cmd IN ('SELECT', 'ALL')
    AND roles && ARRAY['public', 'anon', 'authenticated']::name[]
) THEN 1 ELSE 0 END AS public_read_policy_removed;