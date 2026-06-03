import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import FAQSchema from "@/components/seo/FAQSchema";
import PropertyCard from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, MapPin } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { findLongtailPage, LONGTAIL_PAGES } from "@/lib/longtailPages";
import { paths } from "@/lib/routes";

const SITE = "https://www.huurbaasje.nl";

const LongtailLanding = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const page = findLongtailPage(slug);

  if (!page) {
    return <Navigate to="/niet-gevonden" replace />;
  }

  const { data, isLoading } = useProperties({
    city: page.city,
    listingType: page.filters.listingType,
    propertyType: page.filters.propertyType,
    maxPrice: page.filters.maxPrice,
    minPrice: page.filters.minPrice,
    minBedrooms: page.filters.minBedrooms,
    textMatch: page.filters.textMatch,
    pageSize: 24,
  });
  const properties = Array.isArray(data) ? data : (data?.properties ?? []);

  const itemListJsonLd = useMemo(() => {
    if (!properties.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: properties.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}${paths.property(p.slug || p.id)}`,
        name: p.title,
      })),
    };
  }, [properties]);

  const related = (page.related || [])
    .map(findLongtailPage)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title={page.metaTitle}
        description={page.metaDescription}
        canonical={`/gids/${page.slug}`}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      {/* FAQSchema is rendered visibly in the FAQ section below; hide here to avoid duplicate JSON-LD only */}

      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b-2 border-foreground bg-secondary">
          <div className="container py-10 md:py-14">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Gidsen", href: "/plekken" },
                { label: page.city, href: paths.city(page.citySlug) },
                { label: page.h1 },
              ]}
            />
            <h1 className="mt-6 font-display text-4xl uppercase leading-tight text-foreground md:text-5xl lg:text-6xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-muted-foreground md:text-xl">
              {page.intro}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to={paths.city(page.citySlug)}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Alles in {page.city}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/woonradar">Krijg meldingen per e-mail</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Editorial sections */}
        <section className="border-b-2 border-foreground">
          <div className="container grid gap-10 py-12 md:grid-cols-3 md:py-16">
            {page.sections.map((s) => (
              <article key={s.h2}>
                <h2 className="font-display text-2xl uppercase leading-tight text-foreground">
                  {s.h2}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Live listings */}
        <section className="border-b-2 border-foreground">
          <div className="container py-12 md:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl uppercase text-foreground md:text-4xl">
                  Actueel aanbod
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {properties.length > 0
                    ? `${properties.length} woning${properties.length === 1 ? "" : "en"} gevonden in ${page.city}`
                    : `Op dit moment geen woningen die volledig matchen. Stel een Woonradar in om als eerste bericht te krijgen.`}
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link to={paths.city(page.citySlug)}>
                  Alle in {page.city}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-lg border bg-card">
                      <Skeleton className="aspect-[4/3] w-full" />
                      <div className="space-y-3 p-4">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))
                : properties.slice(0, 12).map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b-2 border-foreground bg-secondary">
          <div className="container py-12 md:py-16">
            <FAQSchema
              title="Veelgestelde vragen"
              items={page.faq.map((f) => ({ question: f.q, answer: f.a }))}
            />
          </div>
        </section>


        {/* Related */}
        {related.length > 0 && (
          <section>
            <div className="container py-12 md:py-16">
              <h2 className="font-display text-3xl uppercase text-foreground md:text-4xl">
                Ook interessant
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/gids/${r.slug}`}
                    className="group flex items-center justify-between rounded-lg border-2 border-foreground bg-card p-5 transition hover:bg-secondary"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{r.city}</p>
                      <p className="mt-1 font-semibold text-foreground group-hover:underline">{r.h1}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LongtailLanding;

/** Export voor build-time gebruik (sitemap etc.) */
export const ALL_LONGTAIL_SLUGS = LONGTAIL_PAGES.map((p) => p.slug);
