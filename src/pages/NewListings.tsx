import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays } from "lucide-react";
import StockBanner from "@/components/layout/StockBanner";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const PropertyCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg border bg-card">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-6 w-1/3" />
    </div>
  </div>
);

const NewListings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  const { startIso, endIso, dateLabel } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      dateLabel: new Intl.DateTimeFormat("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(start),
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["new-listings", startIso, endIso, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("properties")
        .select("*", { count: "exact" })
        .eq("status", "actief")
        .gte("created_at", startIso)
        .lt("created_at", endIso)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        properties: (data ?? []) as Property[],
        totalCount: count ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const properties = data?.properties ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);

  const title = "Nieuw aanbod vandaag | Huurbaasje";
  const description = `Bekijk ${totalCount} nieuwe actieve woningen van vandaag (${dateLabel}) op Huurbaasje.`;
  const canonical = "https://www.huurbaasje.nl/nieuw-aanbod";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    description,
    numberOfItems: totalCount,
    itemListElement: properties.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.huurbaasje.nl/woning/${p.slug || p.id}`,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead title={title} description={description} canonical={canonical} />
      <Header />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <StockBanner
          seed={`new-${dateLabel}`}
          title="Nieuw aanbod van vandaag"
          subtitle={isLoading ? "Laden..." : `${totalCount} actieve woningen toegevoegd op ${dateLabel}`}
        >
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Nieuw aanbod" }]} />
        </StockBanner>

        <section className="container py-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Vorige
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Pagina {currentPage} van {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Volgende
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <h2 className="font-display text-xl font-semibold">Nog geen nieuw aanbod vandaag</h2>
              <p className="mt-2 text-muted-foreground">
                Er zijn vandaag nog geen nieuwe actieve woningen geplaatst. Kom later nog eens terug.
              </p>
            </div>
          )}
        </section>

        <section className="border-t bg-muted/30 py-12">
          <div className="container">
            <h2 className="mb-4 font-display text-2xl font-bold">Nieuw woningaanbod per dag</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Op deze pagina vind je uitsluitend het nieuwe actieve woningaanbod dat vandaag is toegevoegd 
                op Huurbaasje. Zo zie je direct welke huurwoningen en koopwoningen als eerste online zijn 
                gekomen en kun je snel reageren.
              </p>
              <p>
                Huurbaasje scant dagelijks meerdere woningplatforms en makelaarswebsites in heel Nederland. 
                Nieuwe woningen worden automatisch verwerkt en verschijnen op deze pagina zodra ze 
                beschikbaar zijn. Het aanbod wordt doorlopend ververst gedurende de dag.
              </p>
              <p>
                Wil je geen dag missen? Stel een gratis dagelijkse alert in en ontvang elke dag een 
                e-mail met een samenvatting van het nieuwe aanbod. Of gebruik de zoekpagina om verder 
                te filteren op stad, prijs, woningtype en meer. Bekijk ook onze interactieve kaart 
                op de verkenningspagina om woningen in jouw directe omgeving te ontdekken.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NewListings;
