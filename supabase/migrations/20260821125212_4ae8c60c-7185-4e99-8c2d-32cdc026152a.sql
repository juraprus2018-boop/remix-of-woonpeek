create or replace function public.province_from_postal(_pc text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p is null then null
    when p in (13) then 'Flevoland'
    when p between 10 and 21 then 'Noord-Holland'
    when p between 22 and 33 then 'Zuid-Holland'
    when p between 34 and 39 then 'Utrecht'
    when p between 40 and 41 then 'Gelderland'
    when p = 42 then 'Zuid-Holland'
    when p between 43 and 45 then 'Zeeland'
    when p between 46 and 58 then 'Noord-Brabant'
    when p between 59 and 65 then 'Limburg'
    when p between 66 and 73 then 'Gelderland'
    when p between 74 and 78 then 'Overijssel'
    when p = 79 then 'Drenthe'
    when p between 80 and 81 then 'Overijssel'
    when p between 82 and 83 then 'Flevoland'
    when p between 84 and 92 then 'Friesland'
    when p between 93 and 94 then 'Drenthe'
    when p between 95 and 99 then 'Groningen'
    else null
  end
  from (
    select nullif(regexp_replace(coalesce(_pc,''), '\D', '', 'g'), '') as digits
  ) d,
  lateral (select case when d.digits is null or length(d.digits) < 4 then null else left(d.digits,2)::int end as p) x;
$$;

create or replace function public.market_stats_extra()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with base as (
  select city, price::numeric as price, surface_area, listing_type::text as lt,
         created_at, build_year, postal_code,
         public.province_from_postal(postal_code) as province
  from public.properties
  where status = 'actief' and city is not null and price is not null and price > 0
),
huur as (select * from base where lt = 'huur'),
koop as (select * from base where lt = 'koop')
select jsonb_build_object(
  'generated_at', now(),
  'period_start', date_trunc('month', now())::date,
  'period_end', current_date,
  'analyzed', (select count(*) from base),
  'rent_count_cities', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*) as n, round(avg(price)) as avg_price,
             round(min(price)) as min_price,
             round(percentile_cont(0.5) within group (order by price)) as median_price
      from huur group by city order by count(*) desc, city limit 50
    ) t
  ),
  'buy_count_cities', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*) as n, round(avg(price)) as avg_price,
             round(min(price)) as min_price,
             round(percentile_cont(0.5) within group (order by price)) as median_price
      from koop group by city order by count(*) desc, city limit 50
    ) t
  ),
  'cheapest_rent_cities', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*) as n, round(avg(price)) as avg_price,
             round(min(price)) as min_price,
             round(avg(price / nullif(surface_area,0)), 2) as per_m2,
             round(avg(surface_area)) as avg_area
      from huur where price between 200 and 10000
      group by city having count(*) >= 5
      order by avg(price) asc limit 30
    ) t
  ),
  'new_per_week', (
    select coalesce(jsonb_agg(t order by (t->>'week_start') desc), '[]'::jsonb) from (
      select jsonb_build_object(
        'week_start', to_char(date_trunc('week', created_at), 'YYYY-MM-DD'),
        'n', count(*),
        'rent_n', count(*) filter (where lt = 'huur'),
        'buy_n', count(*) filter (where lt = 'koop'),
        'avg_rent', round(avg(price) filter (where lt = 'huur' and price between 200 and 10000))
      ) as t
      from base
      where created_at > now() - interval '12 weeks'
      group by date_trunc('week', created_at)
    ) s
  ),
  'newbuild_provinces', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select province as city, count(*) as n,
             round(avg(price)) as avg_price,
             count(*) filter (where lt = 'huur') as rent_n,
             count(*) filter (where lt = 'koop') as buy_n
      from base
      where province is not null
        and build_year is not null
        and build_year >= extract(year from now())::int - 5
      group by province order by count(*) desc
    ) t
  ),
  'provinces_all', (
    select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select province as city, count(*) as n, round(avg(price)) as avg_price
      from base where province is not null
      group by province order by count(*) desc
    ) t
  )
);
$$;

grant execute on function public.market_stats_extra() to anon, authenticated, service_role;
grant execute on function public.province_from_postal(text) to anon, authenticated, service_role;