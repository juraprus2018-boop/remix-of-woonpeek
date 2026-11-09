import { Link, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { getPortalGuide, portalGuideFaqLd } from "@/lib/portalGuides";
import { CheckCircle2, ExternalLink } from "lucide-react";

const PortalGuide = () => {
  const slug = useLocation().pathname.split("/").filter(Boolean).pop() ?? "";
  const g = getPortalGuide(slug)!;
  const mainCity = g.cities[0];
  const { data } = useProperties({ city: mainCity[0], listingType: "huur", pageSize: 6, sortBy: "newest" });
  const listings = (data as any)?.properties ?? (Array.isArray(data) ? data : []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={g.title} description={g.description} />
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(portalGuideFaqLd(g)) }} />
        <section className="border-b-2 border-foreground bg-card">
          <div className="container py-10 md:py-14">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sociale huur", href: "/sociale-huur-wachttijd" }, { label: g.name }]} />
            <h1 className="mt-6 font-display text-3xl md:text-5xl text-foreground">{g.name}: inschrijven en huurwoning vinden</h1>
            <p className="mt-3 max-w-3xl text-base text-muted-foreground">{g.intro}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Woonaanbod NL is geen officiële site van {g.name}.{" "}
              <a href={g.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-primary hover:underline">
                Naar de officiële site <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </section>

        <section className="border-b-2 border-foreground py-12">
          <div className="container grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">Kort overzicht</h2>
              <dl className="mt-4 divide-y divide-border rounded-2xl border-2 border-foreground bg-card">
                {g.facts.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-3 px-4 py-3 text-sm">
                    <dt className="font-medium">{k}</dt>
                    <dd className="col-span-2 text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl">Zo vergroot je je kans</h2>
              <ol className="mt-4 space-y-3 text-sm">
                {g.steps.map((s) => (
                  <li key={s} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{s}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground bg-card py-12">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl">Nu te huur in {mainCity[0]}, zonder wachtlijst</h2>
            <p className="mt-2 text-sm text-muted-foreground">Nieuwste huurwoningen uit ons aanbod. Hiervoor heb je geen inschrijving bij {g.name} nodig.</p>
            <div className="mt-6 space-y-4">
              {listings.slice(0, 6).map((p: any) => <PropertyCard key={p.id} property={p} />)}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {g.cities.map(([n, s]) => (
                <Link key={s} to={`/huurwoningen/${s}`} className="rounded-full border-2 border-foreground px-3 py-1 text-sm hover:bg-accent/10">Huurwoningen {n}</Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl">Veelgestelde vragen over {g.name}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {g.faq.map(([q, a]) => (
                <div key={q} className="rounded-2xl border-2 border-foreground bg-card p-5">
                  <h3 className="font-medium">{q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Gecontroleerd op {g.checked}. Zie ook <Link to="/sociale-huur-wachttijd" className="text-primary hover:underline">wachttijd sociale huur per stad</Link> en <Link to="/woonmelding" className="text-primary hover:underline">gratis woningmelding</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PortalGuide;
