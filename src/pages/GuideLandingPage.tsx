import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProperties } from "@/hooks/useProperties";
import { CheckCircle2, BellRing, ArrowRight } from "lucide-react";
import { GUIDE_PAGES, type GuidePage } from "@/lib/guidePages";

const RELATED_LABELS: Record<string, string> = {
  "/woonmelding": "Gratis woonmelding",
  "/budgetcheck": "Budgettool",
  "/sociale-huur-wachttijd": "Wachttijd sociale huur",
  "/expat-housing": "Expat housing",
};
const labelFor = (p: string) => RELATED_LABELS[p] || GUIDE_PAGES.find((g) => g.path === p)?.h1 || p;

const GuideLandingPage = ({ guide }: { guide: GuidePage }) => {
  const { data, isLoading } = useProperties({
    listingType: "huur",
    textMatch: guide.listings.textMatch,
    maxPrice: guide.listings.maxPrice,
    propertyType: guide.listings.propertyType,
    pageSize: 8,
  });
  const properties = (data?.properties || []).slice(0, 8);
  const url = `https://www.woonaanbod-nl.nl${guide.path}`;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.description,
    mainEntityOfPage: url,
    inLanguage: "nl-NL",
    dateModified: new Date().toISOString().slice(0, 10),
    publisher: { "@type": "Organization", name: "Woonaanbod NL", url: "https://www.woonaanbod-nl.nl" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={guide.title} description={guide.description} />
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
        <section className="border-b bg-card">
          <div className="container py-10 md:py-14">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: guide.h1 }]} />
            <h1 className="mt-6 font-display text-3xl font-bold text-foreground md:text-5xl">{guide.h1}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{guide.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/woonmelding" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                <BellRing className="h-4 w-4" /> Ontvang gratis nieuw aanbod
              </Link>
              <a href="#aanbod" className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 font-semibold hover:bg-accent">
                Bekijk aanbod <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container grid gap-10 lg:grid-cols-3">
            <article className="space-y-10 lg:col-span-2">
              {guide.sections.map((s) => (
                <div key={s.title}>
                  <h2 className="font-display text-2xl font-bold">{s.title}</h2>
                  <div className="mt-3 space-y-3 text-muted-foreground">
                    {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
                  </div>
                  {s.bullets && (
                    <ul className="mt-4 space-y-2">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-muted-foreground">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </article>
            <aside className="space-y-4">
              <div className="sticky top-24 rounded-xl border bg-card p-5">
                <h2 className="font-display text-lg font-bold">Lees ook</h2>
                <ul className="mt-3 space-y-2">
                  {guide.related.map((r) => (
                    <li key={r}><Link to={r} className="text-primary hover:underline">{labelFor(r)}</Link></li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section id="aanbod" className="border-t bg-card py-12">
          <div className="container">
            <h2 className="font-display text-2xl font-bold">{guide.listings.title}</h2>
            <div className="mt-6 flex flex-col gap-5">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
                : properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
            <Link to="/huurwoningen" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
              Bekijk alle huurwoningen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <h2 className="font-display text-2xl font-bold">Veelgestelde vragen</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {guide.faq.map((f) => (
                <div key={f.q} className="rounded-xl border bg-card p-5">
                  <h3 className="font-semibold">{f.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GuideLandingPage;
