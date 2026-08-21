import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SEOHead from "@/components/seo/SEOHead";
import FAQSchema from "@/components/seo/FAQSchema";
import EnergyCompareTeaser from "@/components/energy/EnergyCompareTeaser";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Bell, ArrowRight, MapPin } from "lucide-react";
import { cityPath, citySlugToName, cityToSlug } from "@/lib/cities";

const STUDIESTEDEN = [
  "Amsterdam", "Utrecht", "Groningen", "Nijmegen", "Leiden", "Rotterdam",
  "Delft", "Eindhoven", "Tilburg", "Maastricht", "Wageningen", "Enschede",
  "Den Haag", "Breda", "Arnhem", "Zwolle",
];

const formatEuro = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(n);

/**
 * Studenten-landingspagina per (studie)stad: combineert kamers + studio's met
 * een prijsplafond, plus SEO-content rond studeren & wonen in die stad.
 * URL: /studenten/:city
 */
const StudentenCity = () => {
  const { city: citySlug } = useParams<{ city: string }>();
  const cityName = citySlug ? citySlugToName(citySlug) : "Nederland";

  // Studentvriendelijk = kamer of studio, prijs <= 900
  const { data, isLoading } = useProperties({
    city: citySlug ? cityName : undefined,
    propertyTypes: ["kamer", "studio"],
    listingType: "huur",
    maxPrice: 900,
    disablePagination: true,
  });

  const properties = (data?.properties || []).sort((a, b) => a.price - b.price);
  const totalCount = data?.totalCount || 0;
  const avgPrice = properties.length
    ? Math.round(properties.reduce((s, p) => s + p.price, 0) / properties.length)
    : 0;
  const kamerCount = properties.filter(p => p.property_type === "kamer").length;
  const studioCount = properties.filter(p => p.property_type === "studio").length;

  const currentMonth = new Date().toLocaleString("nl-NL", { month: "long" });
  const currentYear = new Date().getFullYear();

  const title = `Studentenkamer ${cityName} ${currentYear}: ${totalCount} beschikbaar | Woonaanbod NL`;
  const description = `${totalCount} studentenkamers en studio's te huur in ${cityName} onder €900. ✓ Dagelijks bijgewerkt ✓ Gratis alerts ✓ ${currentMonth} ${currentYear}`;
  const canonical = `https://www.woonaanbod-nl.nl/studenten/${citySlug}`;
  const canonicalPath = canonical.replace(/^https?:\/\/[^/]*/i, "");

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Studenten", href: "/studenten" },
    { label: cityName },
  ];

  const faqItems = useMemo(() => [
    {
      question: `Hoeveel studentenkamers zijn er in ${cityName}?`,
      answer: `Op dit moment zijn er ${totalCount} studentenkamers en studio's beschikbaar in ${cityName} onder €900 per maand. Hiervan zijn ${kamerCount} kamers en ${studioCount} studio's.`,
    },
    {
      question: `Wat kost een studentenkamer in ${cityName}?`,
      answer: `De gemiddelde prijs voor een studentvriendelijke woning in ${cityName} is ${avgPrice ? formatEuro(avgPrice) : "ca. €500-€700"} per maand. Kamers zijn doorgaans goedkoper dan studio's.`,
    },
    {
      question: `Hoe vind ik snel een kamer in ${cityName}?`,
      answer: `Stel een gratis dagelijkse alert in op Woonaanbod NL. Je krijgt dan direct een e-mail wanneer er nieuwe studentenkamers in ${cityName} online komen, vaak nog voordat ze massaal bezichtigd worden.`,
    },
    {
      question: `Wanneer kun je het beste een kamer zoeken in ${cityName}?`,
      answer: `De drukste periode is juni-september (voor het collegejaar). Begin minimaal 2-3 maanden van tevoren met zoeken en reageer dezelfde dag op nieuw aanbod.`,
    },
  ], [cityName, totalCount, kamerCount, studioCount, avgPrice]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Studentenkamers ${cityName}`,
      description,
      url: canonical,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead title={title} description={description} canonical={canonicalPath} />
      <Header />
      <main className="flex-1">
        {jsonLd.map((s, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
        ))}

        {/* Hero */}
        <section className="border-b-2 border-foreground bg-accent/10 py-12">
          <div className="container">
            <Breadcrumbs items={breadcrumbs} />
            <div className="mt-4 flex items-start gap-4">
              <div className="hidden rounded-2xl border-2 border-foreground bg-card p-3 sm:block">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold lowercase md:text-5xl">
                  studentenkamers in {cityName.toLowerCase()}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {totalCount} kamers en studio's onder €900 in {cityName}. Gemiddelde prijs: {avgPrice ? formatEuro(avgPrice) : "—"}. Dagelijks ververst uit meerdere bronnen.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link to="/woonradar"><Bell className="mr-2 h-4 w-4" /> Gratis kamer-alert</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to={cityPath(cityName)}>Alle woningen in {cityName} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Listings */}
        <section className="container py-10">
          {isLoading ? (
            <div className="flex flex-col gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="flex flex-col gap-5">
              {properties.map((p) => (<PropertyCard key={p.id} property={p} />))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed py-16 text-center">
              <p className="text-muted-foreground">Geen studentenkamers gevonden in {cityName} onder €900.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to={`/kamer-huren/${citySlug}`}>Bekijk alle kamers in {cityName}</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Energie-teaser (affiliate) */}
        <section className="border-t py-10">
          <div className="container">
            <EnergyCompareTeaser variant="property" context={cityName} />
          </div>
        </section>

        {/* SEO content */}
        <section className="border-t bg-muted/30 py-12">
          <div className="container space-y-4 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-2xl font-bold text-foreground">Studeren en wonen in {cityName}</h2>
            <p>
              {cityName} is één van Nederlands populairste studiesteden. De vraag naar studentenkamers is groot, vooral aan het begin van het collegejaar. Met Woonaanbod NL krijg je <strong>dagelijks vers aanbod</strong> uit meerdere bronnen, zodat je sneller kunt reageren dan andere zoekers.
            </p>
            <p>
              Tip: combineer een <Link to="/woonradar" className="text-primary underline">gratis dagelijkse alert</Link> met een goed voorbereid voorstelbericht. Reageer binnen het uur op nieuwe kamers voor de grootste kans.
            </p>
          </div>
        </section>

        {/* Other student cities */}
        <section className="border-t py-12">
          <div className="container">
            <h2 className="font-display text-2xl font-bold mb-6">Andere studiesteden</h2>
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
              {STUDIESTEDEN.filter(c => c.toLowerCase() !== cityName.toLowerCase()).slice(0, 12).map(c => (
                <Link key={c} to={`/studenten/${cityToSlug(c)}`} className="group flex items-center gap-2 rounded-xl border bg-card p-3 hover:shadow-md">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium group-hover:text-primary">{c}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="container">
            <FAQSchema items={faqItems} title={`Veelgestelde vragen — studentenkamer ${cityName}`} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StudentenCity;
