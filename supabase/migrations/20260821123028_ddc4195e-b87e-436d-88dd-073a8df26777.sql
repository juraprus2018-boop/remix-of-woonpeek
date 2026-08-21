create or replace function public.market_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with base as (
  select city, price::numeric as price, surface_area, listing_type::text as lt, created_at
  from public.properties
  where status = 'actief' and city is not null and price is not null and price > 0
),
huur as (select * from base where lt = 'huur'),
koop as (select * from base where lt = 'koop')
select jsonb_build_object(
  'generated_at', now(),
  'national', jsonb_build_object(
    'total', (select count(*) from base),
    'rent_total', (select count(*) from huur),
    'buy_total', (select count(*) from koop),
    'new_7d', (select count(*) from base where created_at > now() - interval '7 days'),
    'new_30d', (select count(*) from base where created_at > now() - interval '30 days'),
    'rent_avg', (select round(avg(price)) from huur where price between 200 and 10000),
    'rent_median', (select round(percentile_cont(0.5) within group (order by price)) from huur where price between 200 and 10000),
    'rent_per_m2', (select round(avg(price / surface_area), 2) from huur where surface_area between 10 and 500 and price between 200 and 10000),
    'buy_avg', (select round(avg(price)) from koop where price between 50000 and 5000000),
    'buy_median', (select round(percentile_cont(0.5) within group (order by price)) from koop where price between 50000 and 5000000),
    'buy_per_m2', (select round(avg(price / surface_area)) from koop where surface_area between 20 and 1000 and price between 50000 and 5000000),
    'rent_under_1500', (select count(*) from huur where price <= 1500),
    'buy_under_400k', (select count(*) from koop where price <= 400000)
  ),
  'rent_per_m2_cities', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*) as n, round(avg(price / surface_area), 2) as per_m2,
             round(avg(price)) as avg_price, round(avg(surface_area)) as avg_area
      from huur where surface_area between 10 and 500 and price between 200 and 10000
      group by city having count(*) >= 4
      order by round(avg(price / surface_area), 2) desc limit 40
    ) t
  ),
  'new_this_week_cities', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*) as n, round(avg(price)) as avg_price
      from base where created_at > now() - interval '7 days'
      group by city order by count(*) desc, city limit 25
    ) t
  ),
  'rent_under_1500_cities', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*) as n, round(min(price)) as min_price, round(avg(price)) as avg_price
      from huur where price <= 1500
      group by city order by count(*) desc, city limit 25
    ) t
  ),
  'buy_under_400k_cities', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*) as n, round(min(price)) as min_price, round(avg(price)) as avg_price
      from koop where price <= 400000
      group by city order by count(*) desc, city limit 25
    ) t
  ),
  'buy_avg_cities', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*) as n, round(avg(price)) as avg_price,
             round(percentile_cont(0.5) within group (order by price)) as median_price
      from koop where price between 50000 and 5000000
      group by city having count(*) >= 3
      order by count(*) desc limit 30
    ) t
  ),
  'rent_avg_cities', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*) as n, round(avg(price)) as avg_price,
             round(percentile_cont(0.5) within group (order by price)) as median_price
      from huur where price between 200 and 10000
      group by city having count(*) >= 4
      order by count(*) desc limit 40
    ) t
  )
);
$$;

grant execute on function public.market_stats() to anon, authenticated, service_role;