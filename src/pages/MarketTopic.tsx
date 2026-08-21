import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SEOHead from "@/components/seo/SEOHead";
import MarketSourceBlock from "@/components/market/MarketSourceBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMarketStats, useMarketStatsExtra } from "@/hooks/useMarketStats";
import { MARKET_TOPICS, getMarketTopic, marketTopicPath } from "@/lib/marketPages";
import { monthLabel } from "@/lib/marketFormat";
import { cityToSlug } from "@/lib/cities";
import { CANONICAL_URL } from "@/lib/brand";

export default function MarketTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const topic = getMarketTopic(slug);
  const { data: stats, isLoading: loadingStats } = useMarketStats();
  const { data: extra, isLoading: loadingExtra } = useMarketStatsExtra();
  const loading = loadingStats || loadingExtra;

  const period = monthLabel(stats?.generated_at);
  const path = topic ? marketTopicPath(topic.slug) : "/woningmarkt";
  const faq = topic ? topic.faq(stats, extra) : [];

  useEffect(() => {
    if (!topic) return;
    const now = extra?.generated_at ? new Date(extra.generated_at) : new Date();
    const dataset = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: topic.h1(period),
      description: topic.metaDescription(period),
      url: `${CANONICAL_URL}${path}`,
      keywords: topic.keywords,
      license: "https://creativecommons.org/licenses/by/4.0/",
      isAccessibleForFree: true,
      temporalCoverage: extra?.period_start && extra?.period_end ? `${extra.period_start}/${extra.period_end}` : undefined,
      spatialCoverage: { "@type": "Country", name: "Nederland" },
      dateModified: now.toISOString(),
      creator: { "@type": "Organization", name: "Woonaanbod NL", url: CANONICAL_URL },
      isBasedOn: `${CANONICAL_URL}/woningmarkt`,
      distribution: [
        {
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: `${CANONICAL_URL}/marktdata.json`,
        },
      ],
      measurementTechnique: "Aggregatie van het actieve woningaanbod in de Woonaanbod NL database",
      variableMeasured: topic.kpis(stats, extra).map((k) => ({
        "@type": "PropertyValue",
        name: k.label,
        value: k.value,
      })),
    };
    const faqLd = faq.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

    const nodes = [dataset, faqLd].filter(Boolean).map((block) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.dataset.marketTopic = "true";
      el.textContent = JSON.stringify(block);
      document.head.appendChild(el);
      return el;
    });
    return () => nodes.forEach((el) => el.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.slug, stats, extra]);

  if (!topic) return <Navigate to="/woningmarkt" replace />;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={topic.metaTitle(period)}
        description={topic.metaDescription(period)}
        canonical={path}
      />
      <Header />
      <main>
        <section className="border-b border-border bg-primary text-primary-foreground">
          <div className="container py-10 sm:py-14">
            <Breadcrumbs
              items={[
                { label: "Woningmarkt Nederland", href: "/woningmarkt" },
                { label: topic.navLabel, href: path },
              ]}
            />
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground/70">
              Woningmarkt Nederland
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">{topic.h1(period)}</h1>
            {topic.intro.map((p) => (
              <p key={p.slice(0, 30)} className="mt-4 max-w-4xl text-lg text-primary-foreground/85">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section className="container py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topic.kpis(stats, extra).map((k) => (
              <Card key={k.label}>
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">{k.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground tabular-nums sm:text-3xl">
                    {loading ? <Skeleton className="h-8 w-28" /> : k.value}
                  </p>
                  {k.sub && <p className="mt-1 text-sm text-muted-foreground">{k.sub}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="container space-y-12 pb-16">
          {topic.tables.map((t) => {
            const rows = t.rows(stats, extra);
            return (
              <section key={t.title} className="scroll-mt-24">
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{t.title}</h2>
                {t.note && <p className="mt-2 max-w-4xl text-muted-foreground">{t.note}</p>}
                <Card className="mt-4 overflow-hidden">
                  <CardHeader className="border-b border-border bg-secondary/40 py-4">
                    <CardTitle className="text-base font-semibold">{t.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="space-y-2 p-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full" />
                        ))}
                      </div>
                    ) : rows.length === 0 ? (
                      <p className="p-4 text-muted-foreground">Nog geen data beschikbaar voor deze vraag.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead>{t.rowLabel}</TableHead>
                              {t.columns.map((c) => (
                                <TableHead key={c.label} className={c.align === "right" ? "text-right" : ""}>
                                  {c.label}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rows.map((row, i) => (
                              <TableRow key={`${row.city}-${i}`}>
                                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                <TableCell className="font-medium">
                                  {t.linkRows ? (
                                    <Link
                                      to={`/huurwoningen/${cityToSlug(row.city)}`}
                                      className="text-primary hover:underline"
                                    >
                                      {row.city}
                                    </Link>
                                  ) : (
                                    row.city
                                  )}
                                </TableCell>
                                {t.columns.map((c) => (
                                  <TableCell
                                    key={c.label}
                                    className={c.align === "right" ? "text-right tabular-nums" : "tabular-nums"}
                                  >
                                    {c.format(row)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            );
          })}

          {faq.length > 0 && (
            <section id="veelgestelde-vragen">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Veelgestelde vragen
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {faq.map((f) => (
                  <Card key={f.q}>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground">{f.q}</h3>
                      <p className="mt-2 text-muted-foreground">{f.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <MarketSourceBlock
            analyzed={extra?.analyzed ?? stats?.national?.total}
            periodStart={extra?.period_start}
            periodEnd={extra?.period_end}
            generatedAt={extra?.generated_at || stats?.generated_at}
            method={topic.method}
          />

          <section id="meer-cijfers">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Meer cijfers uit de Woonaanbod NL database
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {MARKET_TOPICS.filter((t) => t.slug !== topic.slug).map((t) => (
                <Button key={t.slug} asChild variant="outline" size="sm">
                  <Link to={marketTopicPath(t.slug)}>{t.navLabel}</Link>
                </Button>
              ))}
              <Button asChild size="sm">
                <Link to="/woningmarkt">Overzicht woningmarktcijfers</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
