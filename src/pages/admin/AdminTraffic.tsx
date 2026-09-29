import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Users, MousePointerClick, Smartphone } from "lucide-react";

type Row = Record<string, any>;

type Overview = {
  periode_dagen: number;
  totaal_bezoeken: number;
  totaal_sessies: number;
  bronnen: Row[];
  websites: Row[];
  paginas: Row[];
  landingspaginas_zoek: Row[];
  campagnes: Row[];
  apparaten: Row[];
  per_dag: Row[];
};

const PERIODS = [
  { days: 1, label: "Vandaag" },
  { days: 7, label: "7 dagen" },
  { days: 30, label: "30 dagen" },
];

const Bar = ({ value, max }: { value: number; max: number }) => (
  <div className="h-2 w-full rounded-full bg-muted">
    <div
      className="h-2 rounded-full bg-primary"
      style={{ width: `${max > 0 ? Math.max(3, (value / max) * 100) : 0}%` }}
    />
  </div>
);

const ListCard = ({
  title,
  subtitle,
  rows,
  labelKey,
  link,
}: {
  title: string;
  subtitle?: string;
  rows: Row[];
  labelKey: string;
  link?: boolean;
}) => {
  const max = Math.max(1, ...rows.map((r) => Number(r.bezoeken) || 0));
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nog geen gegevens in deze periode.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                {link ? (
                  <a
                    href={String(r[labelKey])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-primary hover:underline"
                  >
                    {String(r[labelKey])}
                  </a>
                ) : (
                  <span className="truncate font-medium text-foreground">{String(r[labelKey])}</span>
                )}
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {Number(r.bezoeken).toLocaleString("nl-NL")}
                  {r.sessies != null && ` · ${Number(r.sessies).toLocaleString("nl-NL")} bezoekers`}
                </span>
              </div>
              <Bar value={Number(r.bezoeken) || 0} max={max} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminTraffic = () => {
  const [days, setDays] = useState(30);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-traffic", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_traffic_overview" as any, { days } as any);
      if (error) throw error;
      return data as unknown as Overview;
    },
  });

  const stats = [
    {
      label: "Paginaweergaven",
      value: data?.totaal_bezoeken ?? 0,
      icon: MousePointerClick,
    },
    { label: "Bezoekers", value: data?.totaal_sessies ?? 0, icon: Users },
    {
      label: "Verkeersbronnen",
      value: data?.bronnen?.length ?? 0,
      icon: Globe,
    },
    {
      label: "Mobiel",
      value:
        data?.apparaten?.find((a) => a.apparaat === "Mobiel")?.bezoeken ?? 0,
      icon: Smartphone,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bezoekers &amp; verkeer</h1>
            <p className="text-sm text-muted-foreground">
              Waar je bezoekers vandaan komen en welke pagina's ze binnenkomen
            </p>
          </div>
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p.days}
                size="sm"
                variant={days === p.days ? "default" : "outline"}
                onClick={() => setDays(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError || !data ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            De cijfers konden niet worden opgehaald. Probeer het later opnieuw.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <s.icon className="h-4 w-4" />
                    {s.label}
                  </div>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {Number(s.value).toLocaleString("nl-NL")}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ListCard
                title="Verkeersbronnen"
                subtitle="Via welk kanaal bezoekers binnenkomen"
                rows={data.bronnen ?? []}
                labelKey="bron"
              />
              <ListCard
                title="Websites die naar je linken"
                subtitle="De exacte sites waar bezoekers vandaan klikken"
                rows={data.websites ?? []}
                labelKey="host"
              />
              <ListCard
                title="Binnenkomst via zoekmachines en AI"
                subtitle="Pagina's die bezoekers vinden via Google, Bing of ChatGPT"
                rows={data.landingspaginas_zoek ?? []}
                labelKey="pagina"
                link
              />
              <ListCard
                title="Meest bezochte pagina's"
                rows={data.paginas ?? []}
                labelKey="pagina"
                link
              />
              <ListCard
                title="Campagnes"
                subtitle="Bezoek via links met campagnelabel"
                rows={data.campagnes ?? []}
                labelKey="campagne"
              />
              <ListCard title="Apparaten" rows={data.apparaten ?? []} labelKey="apparaat" />
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold text-foreground">Bezoek per dag</h2>
              <div className="mt-4 flex items-end gap-1 overflow-x-auto">
                {(data.per_dag ?? []).map((d) => {
                  const max = Math.max(
                    1,
                    ...(data.per_dag ?? []).map((x) => Number(x.bezoeken) || 0),
                  );
                  const h = Math.max(4, ((Number(d.bezoeken) || 0) / max) * 140);
                  return (
                    <div key={String(d.dag)} className="flex flex-col items-center gap-1">
                      <div
                        className="w-5 rounded-t bg-primary/80"
                        style={{ height: `${h}px` }}
                        title={`${d.dag}: ${d.bezoeken} weergaven`}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {String(d.dag).slice(8)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold text-foreground">Exacte zoekwoorden in Google</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Google geeft de gebruikte zoekwoorden niet mee aan websites. Die cijfers komen uit
                Google Search Console. Zodra die koppeling werkt, verschijnen ze onder Google Ranking.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">Search Console nog niet gekoppeld</Badge>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTraffic;
