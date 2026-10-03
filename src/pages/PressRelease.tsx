import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import NotFound from "./NotFound";
import { CANONICAL_URL } from "@/lib/brand";
import { Download } from "lucide-react";
import { PRESS_KIND_LABEL, formatDateNL, downloadCsv, type PressChart, type PressTable } from "@/lib/press";

const PressRelease = () => {
  const { slug = "" } = useParams();
  const { data: p, isLoading } = useQuery({
    queryKey: ["press", slug],
    queryFn: async () => {
      const { data } = await supabase.from("press_releases").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      return data;
    },
  });

  if (!isLoading && !p) return <NotFound />;
  const chart = p?.chart as unknown as PressChart | null;
  const table = (p?.data as any)?.table as PressTable | undefined;
  const findings = (p?.findings as unknown as string[]) ?? [];
  const url = `${CANONICAL_URL}/pers/${slug}`;
  const citation = p ? `Bron: Woonaanbod NL, ${p.title}, peildatum ${formatDateNL(p.reference_date)}, ${url}` : "";

  return (
    <div className="flex min-h-screen flex-col">
      {p && (
        <SEOHead title={`${p.title} | Woonaanbod NL`} description={p.summary.slice(0, 158)} canonical={`/pers/${slug}`} ogType="article" />
      )}
      {p && (
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "NewsArticle", headline: p.title, description: p.summary, datePublished: p.published_at, url, author: { "@type": "Organization", name: "Woonaanbod NL" }, publisher: { "@type": "Organization", name: "Woonaanbod NL" } },
            { "@type": "Dataset", name: p.title, description: `${p.summary} ${p.methodology}`, temporalCoverage: p.reference_date, url, creator: { "@type": "Organization", name: "Woonaanbod NL" }, license: "https://creativecommons.org/licenses/by/4.0/", isAccessibleForFree: true },
          ],
        })}</script>
      )}
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-10">
          <div className="container">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pers", href: "/pers" }, { label: p?.title ?? "Publicatie" }]} />
            {p && (
              <>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant={p.kind === "landelijk" ? "default" : "secondary"}>{PRESS_KIND_LABEL[p.kind]}</Badge>
                  <span>Gepubliceerd {formatDateNL(p.published_at)}</span>
                </div>
                <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{p.title}</h1>
                <p className="mt-3 text-lg text-muted-foreground">{p.summary}</p>
              </>
            )}
          </div>
        </section>

        {isLoading || !p ? (
          <div className="container py-10"><div className="h-64 animate-pulse rounded-xl border bg-card" /></div>
        ) : (
          <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
            <article className="space-y-8">
              {p.body && <p className="text-muted-foreground">{p.body}</p>}
              <section>
                <h2 className="mb-3 font-display text-xl font-bold">Belangrijkste bevindingen</h2>
                <ul className="list-disc space-y-2 pl-5">{findings.map((f) => <li key={f}>{f}</li>)}</ul>
              </section>

              {chart && chart.rows?.length > 0 && (
                <section className="rounded-xl border bg-card p-5">
                  <h2 className="mb-4 font-display text-lg font-semibold">{chart.title}</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart.rows} margin={{ left: 0, right: 8, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip formatter={(v: number) => `${chart.unit === "€" ? "€ " : ""}${v.toLocaleString("nl-NL")}`} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Bron: Woonaanbod NL, peildatum {formatDateNL(p.reference_date)}.</p>
                </section>
              )}

              {table && (
                <section>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-bold">Cijfers</h2>
                    <Button size="sm" variant="outline" onClick={() => downloadCsv(`${slug}.csv`, table, [citation, `Methode: ${p.methodology}`])}>
                      <Download className="mr-1 h-4 w-4" /> Download cijfers (CSV)
                    </Button>
                  </div>
                  <div className="overflow-x-auto rounded-xl border bg-card">
                    <Table>
                      <TableHeader><TableRow>{table.columns.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow></TableHeader>
                      <TableBody>{table.rows.map((r, i) => <TableRow key={i}>{r.map((v, j) => <TableCell key={j}>{typeof v === "number" ? v.toLocaleString("nl-NL") : v}</TableCell>)}</TableRow>)}</TableBody>
                    </Table>
                  </div>
                </section>
              )}

              <section className="rounded-xl border bg-muted/40 p-5 text-sm">
                <h2 className="mb-2 font-display text-lg font-semibold">Methode en bron</h2>
                <dl className="grid gap-1 sm:grid-cols-[180px_1fr]">
                  <dt className="font-medium">Peildatum</dt><dd>{formatDateNL(p.reference_date)}</dd>
                  <dt className="font-medium">Onderzochte woningen</dt><dd>{p.sample_size.toLocaleString("nl-NL")}</dd>
                  <dt className="font-medium">Methode</dt><dd className="text-muted-foreground">{p.methodology}</dd>
                </dl>
                <p className="mt-3 text-muted-foreground">Deze cijfers zijn een vaste momentopname en worden na publicatie niet aangepast.</p>
              </section>
            </article>

            <aside className="space-y-6">
              <div className="rounded-xl border bg-card p-5 text-sm">
                <h2 className="mb-2 font-display text-lg font-semibold">Bronvermelding</h2>
                <p className="rounded bg-muted p-3 text-muted-foreground">{citation}</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => navigator.clipboard?.writeText(citation)}>Kopieer bronvermelding</Button>
              </div>
              <div className="rounded-xl border bg-card p-5 text-sm">
                <Link to="/pers" className="text-primary hover:underline">Alle publicaties en perscontact</Link>
                {p.city_slug && p.kind === "lokaal" && (
                  <p className="mt-2"><Link to={`/huurwoningen/${p.city_slug}`} className="text-primary hover:underline">Actuele huurwoningen in {p.city_name}</Link></p>
                )}
                <p className="mt-2"><Link to="/woningmarkt" className="text-primary hover:underline">Woningmarkt in cijfers</Link></p>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PressRelease;
