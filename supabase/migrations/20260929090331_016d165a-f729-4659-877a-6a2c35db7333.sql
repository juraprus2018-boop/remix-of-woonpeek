create or replace function public.admin_traffic_overview(days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - (greatest(days,1) || ' days')::interval;
  result jsonb;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not authorized';
  end if;

  with base as (
    select
      session_id,
      page_url,
      created_at,
      user_agent,
      nullif(regexp_replace(coalesce(referrer,''), '^https?://', ''), '') as ref
    from public.page_views
    where created_at >= since
  ), labeled as (
    select *,
      split_part(ref, '/', 1) as ref_host,
      case
        when ref is null then 'Direct / app'
        when ref ilike '%woonaanbod-nl.nl%' or ref ilike '%lovable%' then 'Eigen site'
        when ref ilike '%google.%' then 'Google'
        when ref ilike '%bing.%' or ref ilike '%duckduckgo%' or ref ilike '%yahoo%' or ref ilike '%ecosia%' or ref ilike '%qwant%' or ref ilike '%baidu%' or ref ilike '%yandex%' then 'Andere zoekmachines'
        when ref ilike '%chatgpt%' or ref ilike '%openai%' or ref ilike '%perplexity%' or ref ilike '%claude%' or ref ilike '%copilot%' or ref ilike '%gemini%' then 'AI-chatbots'
        when ref ilike '%facebook%' or ref ilike '%fb.%' then 'Facebook'
        when ref ilike '%instagram%' then 'Instagram'
        when ref ilike '%tiktok%' then 'TikTok'
        when ref ilike '%linkedin%' then 'LinkedIn'
        when ref ilike '%reddit%' then 'Reddit'
        when ref ilike '%whatsapp%' or ref ilike '%t.co%' or ref ilike '%telegram%' then 'Berichtenapps'
        when ref ilike '%mail.%' or ref ilike '%outlook%' then 'E-mail'
        else 'Overige websites'
      end as bron,
      case
        when user_agent ilike '%mobile%' or user_agent ilike '%android%' or user_agent ilike '%iphone%' then 'Mobiel'
        when user_agent ilike '%ipad%' or user_agent ilike '%tablet%' then 'Tablet'
        when user_agent is null then 'Onbekend'
        else 'Desktop'
      end as apparaat,
      nullif(substring(page_url from 'utm_campaign=([^&]+)'), '') as campagne,
      nullif(substring(page_url from 'utm_source=([^&]+)'), '') as utm_source
    from base
  )
  select jsonb_build_object(
    'periode_dagen', greatest(days,1),
    'totaal_bezoeken', (select count(*) from labeled),
    'totaal_sessies', (select count(distinct session_id) from labeled),
    'bronnen', (select coalesce(jsonb_agg(x order by x->>'bezoeken' desc), '[]'::jsonb) from (
        select jsonb_build_object('bron', bron, 'bezoeken', count(*), 'sessies', count(distinct session_id)) as x
        from labeled group by bron order by count(*) desc) s),
    'websites', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('host', ref_host, 'bezoeken', count(*)) as x
        from labeled where ref_host is not null and ref_host <> '' group by ref_host order by count(*) desc limit 25) s),
    'paginas', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('pagina', split_part(page_url, '?', 1), 'bezoeken', count(*), 'sessies', count(distinct session_id)) as x
        from labeled group by split_part(page_url, '?', 1) order by count(*) desc limit 25) s),
    'landingspaginas_zoek', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('pagina', split_part(page_url, '?', 1), 'bezoeken', count(*)) as x
        from labeled where bron in ('Google','Andere zoekmachines','AI-chatbots')
        group by split_part(page_url, '?', 1) order by count(*) desc limit 25) s),
    'campagnes', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('campagne', campagne, 'source', max(utm_source), 'bezoeken', count(*)) as x
        from labeled where campagne is not null group by campagne order by count(*) desc limit 25) s),
    'apparaten', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('apparaat', apparaat, 'bezoeken', count(*)) as x
        from labeled group by apparaat order by count(*) desc) s),
    'per_dag', (select coalesce(jsonb_agg(x order by x->>'dag'), '[]'::jsonb) from (
        select jsonb_build_object('dag', to_char(date_trunc('day', created_at), 'YYYY-MM-DD'), 'bezoeken', count(*), 'sessies', count(distinct session_id)) as x
        from labeled group by date_trunc('day', created_at)) s)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_traffic_overview(int) from public;
grant execute on function public.admin_traffic_overview(int) to authenticated;