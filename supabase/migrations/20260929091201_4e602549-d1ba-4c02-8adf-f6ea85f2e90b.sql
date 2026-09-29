create index if not exists idx_traffic_daily_source_dag on public.traffic_daily_source (dag);
create index if not exists idx_traffic_daily_page_dag on public.traffic_daily_page (dag);

create or replace function public.admin_traffic_overview(days int default 30)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  from_day date := ((now() at time zone 'Europe/Amsterdam')::date - greatest(days,1) + 1);
begin
  return jsonb_build_object(
    'periode_dagen', greatest(days,1),
    'totaal_bezoeken', (select coalesce(sum(bezoeken),0) from public.traffic_daily_source where dag >= from_day),
    'totaal_sessies', (select coalesce(sum(sessies),0) from public.traffic_daily_source where dag >= from_day),
    'bronnen', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('bron', bron, 'bezoeken', sum(bezoeken), 'sessies', sum(sessies)) as x
        from public.traffic_daily_source where dag >= from_day group by bron order by sum(bezoeken) desc) s),
    'websites', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('host', ref_host, 'bezoeken', sum(bezoeken)) as x
        from public.traffic_daily_source where dag >= from_day and ref_host <> ''
        group by ref_host order by sum(bezoeken) desc limit 25) s),
    'apparaten', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('apparaat', apparaat, 'bezoeken', sum(bezoeken)) as x
        from public.traffic_daily_source where dag >= from_day group by apparaat order by sum(bezoeken) desc) s),
    'campagnes', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('campagne', campagne, 'source', max(nullif(utm_source,'')), 'bezoeken', sum(bezoeken)) as x
        from public.traffic_daily_source where dag >= from_day and campagne <> ''
        group by campagne order by sum(bezoeken) desc limit 25) s),
    'paginas', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('pagina', pagina, 'bezoeken', sum(bezoeken), 'sessies', sum(sessies)) as x
        from public.traffic_daily_page where dag >= from_day group by pagina order by sum(bezoeken) desc limit 25) s),
    'landingspaginas_zoek', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('pagina', pagina, 'bezoeken', sum(bezoeken)) as x
        from public.traffic_daily_page
        where dag >= from_day and bron in ('Google','Andere zoekmachines','AI-chatbots')
        group by pagina order by sum(bezoeken) desc limit 25) s),
    'per_dag', (select coalesce(jsonb_agg(x order by x->>'dag'), '[]'::jsonb) from (
        select jsonb_build_object('dag', to_char(dag,'YYYY-MM-DD'), 'bezoeken', sum(bezoeken), 'sessies', sum(sessies)) as x
        from public.traffic_daily_source where dag >= from_day group by dag) s)
  );
end;
$$;

revoke all on function public.admin_traffic_overview(int) from public;
revoke all on function public.admin_traffic_overview(int) from anon;
grant execute on function public.admin_traffic_overview(int) to authenticated;