create table if not exists public.traffic_daily_source (
  dag date not null,
  bron text not null,
  ref_host text not null default '',
  apparaat text not null default 'Onbekend',
  campagne text not null default '',
  utm_source text not null default '',
  bezoeken int not null default 0,
  sessies int not null default 0,
  primary key (dag, bron, ref_host, apparaat, campagne, utm_source)
);

create table if not exists public.traffic_daily_page (
  dag date not null,
  pagina text not null,
  bron text not null,
  bezoeken int not null default 0,
  sessies int not null default 0,
  primary key (dag, pagina, bron)
);

grant select on public.traffic_daily_source to authenticated;
grant select on public.traffic_daily_page to authenticated;
grant all on public.traffic_daily_source to service_role;
grant all on public.traffic_daily_page to service_role;

alter table public.traffic_daily_source enable row level security;
alter table public.traffic_daily_page enable row level security;

drop policy if exists "Admins can view traffic sources" on public.traffic_daily_source;
create policy "Admins can view traffic sources" on public.traffic_daily_source
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can view traffic pages" on public.traffic_daily_page;
create policy "Admins can view traffic pages" on public.traffic_daily_page
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.classify_traffic_source(referrer text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(referrer,'') = '' then 'Direct / app'
    when referrer ilike '%woonaanbod-nl.nl%' or referrer ilike '%lovable%' then 'Eigen site'
    when referrer ilike '%google.%' then 'Google'
    when referrer ilike '%bing.%' or referrer ilike '%duckduckgo%' or referrer ilike '%yahoo%' or referrer ilike '%ecosia%' or referrer ilike '%qwant%' or referrer ilike '%baidu%' or referrer ilike '%yandex%' then 'Andere zoekmachines'
    when referrer ilike '%chatgpt%' or referrer ilike '%openai%' or referrer ilike '%perplexity%' or referrer ilike '%claude%' or referrer ilike '%copilot%' or referrer ilike '%gemini%' then 'AI-chatbots'
    when referrer ilike '%facebook%' or referrer ilike '%fb.%' then 'Facebook'
    when referrer ilike '%instagram%' then 'Instagram'
    when referrer ilike '%tiktok%' then 'TikTok'
    when referrer ilike '%linkedin%' then 'LinkedIn'
    when referrer ilike '%reddit%' then 'Reddit'
    when referrer ilike '%whatsapp%' or referrer ilike '%t.co%' or referrer ilike '%telegram%' then 'Berichtenapps'
    when referrer ilike '%mail.%' or referrer ilike '%outlook%' then 'E-mail'
    else 'Overige websites'
  end;
$$;

create or replace function public.rollup_traffic_daily(days_back int default 2)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  from_day date := ((now() at time zone 'Europe/Amsterdam')::date - greatest(days_back,0));
begin
  delete from public.traffic_daily_source where dag >= from_day;
  delete from public.traffic_daily_page where dag >= from_day;

  insert into public.traffic_daily_source (dag, bron, ref_host, apparaat, campagne, utm_source, bezoeken, sessies)
  select dag, bron, ref_host, apparaat, campagne, utm_source, count(*), count(distinct session_id)
  from (
    select
      (created_at at time zone 'Europe/Amsterdam')::date as dag,
      session_id,
      public.classify_traffic_source(referrer) as bron,
      coalesce(split_part(regexp_replace(coalesce(referrer,''), '^https?://', ''), '/', 1), '') as ref_host,
      case
        when user_agent ilike '%ipad%' or user_agent ilike '%tablet%' then 'Tablet'
        when user_agent ilike '%mobile%' or user_agent ilike '%android%' or user_agent ilike '%iphone%' then 'Mobiel'
        when user_agent is null then 'Onbekend'
        else 'Desktop'
      end as apparaat,
      coalesce(substring(page_url from 'utm_campaign=([^&]+)'), '') as campagne,
      coalesce(substring(page_url from 'utm_source=([^&]+)'), '') as utm_source
    from public.page_views
    where (created_at at time zone 'Europe/Amsterdam')::date >= from_day
  ) s
  group by dag, bron, ref_host, apparaat, campagne, utm_source;

  insert into public.traffic_daily_page (dag, pagina, bron, bezoeken, sessies)
  select dag, pagina, bron, count(*), count(distinct session_id)
  from (
    select
      (created_at at time zone 'Europe/Amsterdam')::date as dag,
      session_id,
      split_part(page_url, '?', 1) as pagina,
      public.classify_traffic_source(referrer) as bron
    from public.page_views
    where (created_at at time zone 'Europe/Amsterdam')::date >= from_day
  ) s
  group by dag, pagina, bron;
end;
$$;

revoke all on function public.rollup_traffic_daily(int) from public;
revoke all on function public.rollup_traffic_daily(int) from anon;
revoke all on function public.rollup_traffic_daily(int) from authenticated;