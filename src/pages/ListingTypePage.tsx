import { useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyRowCard from "@/components/properties/PropertyRowCard";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SEOHead from "@/components/seo/SEOHead";
import SimilarProperties from "@/components/city/SimilarProperties";
import RelatedCities from "@/components/city/RelatedCities";
import { useProperties, useNearbyProperties, useFilterFacets } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, MapPin, Search, List, Map as MapIcon } from "lucide-react";
import { cityPath, citySlugToName } from "@/lib/cities";
import { isValidDutchCity, getValidCityName } from "@/lib/dutchCities";
import type { Database } from "@/integrations/supabase/types";
import FAQSchema from "@/components/seo/FAQSchema";
import SearchFilters, { type SearchFilterValues } from "@/components/search/SearchFilters";
import ExploreMap from "@/components/explore/ExploreMap";
import { useTranslation } from "react-i18next";

type ListingType = Database["public"]["Enums"]["listing_type"];

interface ListingTypePageProps {
  listingType: "huur" | "koop";
}

const LABELS: Record<string, { plural: string; singular: string; slug: string }> = {
  huur: { plural: "Huurwoningen", singular: "huurwoning", slug: "huurwoningen" },
  koop: { plural: "Koopwoningen", singular: "koopwoning", slug: "koopwoningen" },
};

const PropertyCardSkeleton = () => (
  <div className="rounded-lg border bg-card overflow-hidden">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-4 space-y-3">
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

const ListingTypePage = ({ listingType }: ListingTypePageProps) => {
  const { city: citySlug } = useParams<{ city: string }>();
  const label = LABELS[listingType];

  // Validate city slug against known Dutch cities
  const validCityName = citySlug ? getValidCityName(citySlug) : undefined;
  const isInvalidCity = !!citySlug && !validCityName;
  const cityName = citySlug ? (validCityName || citySlugToName(citySlug)) : undefined;
  const locationLabel = cityName || "Nederland";

  const ITEMS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [view, setView] = useState<"list" | "map">("list");

  const EMPTY_FILTERS: SearchFilterValues = {
    city: "",
    propertyType: "",
    listingType: listingType as ListingType,
    maxPrice: undefined,
    minBedrooms: undefined,
    minSurface: undefined,
    includeInactive: false,
    grossIncome: undefined,
  };
  const [filters, setFilters] = useState<SearchFilterValues>(EMPTY_FILTERS);

  const { data: facets } = useFilterFacets({
    city: isInvalidCity ? undefined : cityName,
    listingType: listingType as ListingType,
    propertyType: (filters.propertyType as Database["public"]["Enums"]["property_type"]) || undefined,
    includeInactive: false,
  });

  const { data, isLoading } = useProperties({
    listingType: listingType as ListingType,
    city: isInvalidCity ? undefined : cityName,
    propertyType: (filters.propertyType as Database["public"]["Enums"]["property_type"]) || undefined,
    maxPrice: filters.maxPrice,
    minBedrooms: filters.minBedrooms,
    minSurface: filters.minSurface,
    pageSize: 50,
  });

  const properties = data?.properties || [];
  const totalCount = data?.totalCount || 0;
  const hasListings = totalCount > 0;
  const countLabel = hasListings ? `${totalCount} woningen` : "actueel aanbod";

  const visibleProperties = properties.slice(0, visibleCount);
  const handleLoadMore = () => setVisibleCount((c) => c + ITEMS_PER_PAGE);

  // Fetch nearby/recent properties when city has no listings
  const { data: nearbyProperties, isLoading: nearbyLoading } = useNearbyProperties(
    cityName,
    listingType,
    !isInvalidCity && !hasListings && !isLoading && !!cityName,
    9
  );

  const shouldRedirect = isInvalidCity;

  const { t, i18n } = useTranslation();
  const localeTag = i18n.language === "en" ? "en-GB" : i18n.language === "de" ? "de-DE" : i18n.language === "fr" ? "fr-FR" : "nl-NL";
  const currentMonth = new Date().toLocaleString(localeTag, { month: "long" });
  const currentYear = new Date().getFullYear();

  // Localized plural / verb / price-word per listing type
  const LOCAL_LABELS: Record<string, Record<"huur" | "koop", { plural: string; type: string; priceWord: string }>> = {
    nl: { huur: { plural: "Huurwoningen", type: "huur", priceWord: "huurprijzen" }, koop: { plural: "Koopwoningen", type: "koop", priceWord: "koopprijzen" } },
    en: { huur: { plural: "Rental homes", type: "rent", priceWord: "rental prices" }, koop: { plural: "Homes for sale", type: "buy", priceWord: "sale prices" } },
    de: { huur: { plural: "Mietwohnungen", type: "Mieten", priceWord: "Mietpreise" }, koop: { plural: "Kaufobjekte", type: "Kaufen", priceWord: "Kaufpreise" } },
    fr: { huur: { plural: "Locations", type: "louer", priceWord: "loyers" }, koop: { plural: "Biens à vendre", type: "acheter", priceWord: "prix de vente" } },
  };
  const lng = (i18n.language as "nl" | "en" | "de" | "fr") in LOCAL_LABELS ? (i18n.language as "nl" | "en" | "de" | "fr") : "nl";
  const ll = LOCAL_LABELS[lng][listingType];

  const pageTitle = cityName
    ? t("meta.listingCityTitle", { plural: ll.plural, city: cityName, total: hasListings ? totalCount : "—", type: ll.type, month: currentMonth, year: currentYear })
    : t("meta.listingNLTitle", { plural: ll.plural, type: ll.type, month: currentMonth, year: currentYear });

  const pageDesc = cityName
    ? t("meta.listingCityDesc", { plural: ll.plural, pluralLc: ll.plural.toLowerCase(), city: cityName, total: hasListings ? totalCount : "—", priceWord: ll.priceWord, month: currentMonth, year: currentYear })
    : t("meta.listingNLDesc", { plural: ll.plural, pluralLc: ll.plural.toLowerCase(), priceWord: ll.priceWord });

  const canonical = cityName
    ? `/${label.slug}/${citySlug}`
    : `/${label.slug}`;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(cityName
      ? [
          { label: cityName, href: cityPath(cityName) },
          { label: label.plural },
        ]
      : [{ label: label.plural }]),
  ];

  // FAQ
  const faqItems = useMemo(() => {
    const items = [
      {
        question: `Hoeveel ${label.plural.toLowerCase()} zijn er in ${locationLabel}?`,
        answer: hasListings
          ? `Op dit moment staan er ${totalCount} ${label.plural.toLowerCase()} in ${locationLabel} op Woonaanbod NL. Het aanbod wordt dagelijks bijgewerkt uit meerdere bronnen.`
          : `Momenteel zijn er geen ${label.plural.toLowerCase()} beschikbaar in ${locationLabel}. Het aanbod wordt dagelijks bijgewerkt, dus stel een alert in om als eerste op de hoogte te zijn.`,
      },
      {
        question: `Wat kost een ${label.singular} in ${locationLabel}?`,
        answer: `De prijzen van ${label.plural.toLowerCase()} in ${locationLabel} variëren per locatie, grootte en woningtype. Gebruik de zoekfilters om te filteren op jouw maximale ${listingType === "huur" ? "huurprijs" : "koopprijs"}.`,
      },
      {
        question: `Hoe vind ik snel een ${label.singular} in ${locationLabel}?`,
        answer: `Woonaanbod NL verzamelt dagelijks nieuw woningaanbod uit meerdere bronnen. Stel een gratis dagelijkse alert in om als eerste te reageren op nieuwe ${label.plural.toLowerCase()} in ${locationLabel}.`,
      },
      {
        question: `Kan ik een alert instellen voor ${label.plural.toLowerCase()} in ${locationLabel}?`,
        answer: `Ja, je kunt gratis een dagelijkse e-mailalert instellen. Zodra er nieuwe ${label.plural.toLowerCase()} beschikbaar komen in ${locationLabel} ontvang je direct een melding.`,
      },
    ];
    if (listingType === "huur") {
      items.push({
        question: `Hoe reageer ik op een ${label.singular} in ${locationLabel}?`,
        answer: `Klik op een woning om de details te bekijken. Via de bronlink kun je direct reageren bij de verhuurder of makelaar. Reageer snel, want populaire ${label.plural.toLowerCase()} in ${locationLabel} zijn vaak binnen enkele dagen verhuurd.`,
      });
    } else {
      items.push({
        question: `Is het een goed moment om een woning te kopen in ${locationLabel}?`,
        answer: `De koopwoningmarkt in ${locationLabel} is dynamisch. Bekijk het actuele aanbod en vergelijk prijzen om een goed beeld te krijgen. Woonaanbod NL toont dagelijks nieuw aanbod zodat je geen kans mist.`,
      });
    }
    return items;
  }, [label, locationLabel, totalCount, listingType]);

  // JSON-LD
  const jsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${label.plural} in ${locationLabel}`,
        description: pageDesc,
        url: canonical,
        isPartOf: { "@type": "WebSite", name: "Woonaanbod NL", url: "https://www.woonaanbod-nl.nl" },
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${label.plural} in ${locationLabel}`,
        numberOfItems: totalCount,
        itemListElement: properties.slice(0, 10).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://www.woonaanbod-nl.nl/woning/${p.slug || p.id}`,
          name: p.title,
          ...(p.images?.length ? { image: p.images[0] } : {}),
        })),
      },
    ],
    [label.plural, locationLabel, pageDesc, canonical, totalCount, properties]
  );

  // Redirect invalid cities after all hooks
  if (shouldRedirect) {
    return <Navigate to="/niet-gevonden" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead title={pageTitle} description={pageDesc} canonical={canonical} />
      <Header />
      <main className="flex-1">
        {jsonLd.map((schema, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        ))}

        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container">
            <div className="mb-4">
              <Breadcrumbs items={breadcrumbs} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                {label.plural} in {locationLabel}{listingType === "huur" ? ": huis en appartement te huur" : ": huizen en appartementen te koop"}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Zoek je een <strong>{label.singular} in {locationLabel}</strong>?{" "}
                {hasListings
                  ? `Bekijk ${totalCount} beschikbare ${label.plural.toLowerCase()} met ${listingType === "huur" ? "huurprijzen" : "koopprijzen"}, foto's en details.`
                  : `Er zijn momenteel geen ${label.plural.toLowerCase()} beschikbaar, maar het aanbod wordt dagelijks bijgewerkt.`}{" "}
                Woonaanbod NL verzamelt dagelijks het nieuwste aanbod uit tientallen bronnen, zodat je sneller vindt wat je zoekt.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {hasListings && (
                <div className="rounded-full bg-card px-4 py-2 text-sm text-foreground shadow-sm">
                  {totalCount} {label.plural.toLowerCase()} beschikbaar
                </div>
                )}
                {cityName && (
                  <Link
                    to="/woonradar"
                    className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    Dagelijkse alert instellen
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Properties */}
        <section className="w-full px-4 py-8 md:px-8">
          {/* Filters bovenaan, 1 regel */}
          <div className="mb-4 rounded-2xl border bg-card p-4">
            <SearchFilters
              filters={filters}
              onChange={(f) => setFilters({ ...f, listingType: listingType as ListingType })}
              onClear={() => setFilters(EMPTY_FILTERS)}
              hideLocation
              facets={facets}
              horizontal
            />
          </div>

          {/* View toggle */}
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border bg-card p-3">
            <div className="text-sm text-muted-foreground">
              {isLoading ? "Aanbod laden..." : `${properties.length} ${label.plural.toLowerCase()} gevonden${cityName ? ` in ${cityName}` : ""}`}
            </div>
            <div className="inline-flex rounded-lg border bg-background p-1">
              <Button
                size="sm"
                variant={view === "list" ? "default" : "ghost"}
                className="gap-2"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" /> Lijst
              </Button>
              <Button
                size="sm"
                variant={view === "map" ? "default" : "ghost"}
                className="gap-2"
                onClick={() => setView("map")}
              >
                <MapIcon className="h-4 w-4" /> Kaart
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              {view === "map" ? (
                <div className="h-[600px] w-full overflow-hidden rounded-2xl border">
                  <ExploreMap properties={properties as any} />
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {visibleProperties.map((property, i) => (
                    <PropertyRowCard key={property.id} property={property} priority={i < 2} />
                  ))}
                </div>
              )}
              {view === "list" && visibleCount < properties.length && (
                <div className="mt-8 text-center">
                  <Button className="gap-2 bg-accent text-accent-foreground font-semibold shadow-md hover:bg-accent/90" onClick={handleLoadMore}>
                    Meer woningen laden ({properties.length - visibleCount} resterend)
                  </Button>
                </div>
              )}
              <div className="mt-4 text-center">
                <Link
                  to={`/zoeken?aanbod=${listingType}${cityName ? `&locatie=${encodeURIComponent(cityName)}` : ""}`}
                >
                  <Button variant="outline" className="gap-2">
                    Bekijk alle {label.plural.toLowerCase()}
                    {cityName ? ` in ${cityName}` : ""}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
                <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="font-display text-xl font-semibold">
                  Momenteel geen {label.plural.toLowerCase()} in {locationLabel}
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Er zijn op dit moment geen {label.plural.toLowerCase()} beschikbaar in {locationLabel}.
                  Stel een alert in om als eerste op de hoogte te zijn wanneer er nieuw aanbod komt.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link to="/woonradar">
                    <Button>Alert instellen</Button>
                  </Link>
                  <Link to="/vinden">
                    <Button variant="outline">Alle woningen bekijken</Button>
                  </Link>
                </div>
              </div>

              {/* Nearby / recent properties */}
              {nearbyLoading ? (
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Recente {label.plural.toLowerCase()} in de buurt
                  </h3>
                  <div className="flex flex-col gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <PropertyCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ) : nearbyProperties && nearbyProperties.length > 0 ? (
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                    Recente {label.plural.toLowerCase()} elders in Nederland
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bekijk het nieuwste aanbod {label.plural.toLowerCase()} uit andere plaatsen
                  </p>
                  <div className="flex flex-col gap-5">
                    {nearbyProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {/* SEO Text */}
        <section className="border-t bg-muted/30 py-12">
          <div className="container">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {label.singular.charAt(0).toUpperCase() + label.singular.slice(1)} zoeken in {locationLabel}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Op Woonaanbod NL vind je het meest actuele aanbod van <strong>{label.plural.toLowerCase()} in {locationLabel}</strong>.
                We verzamelen dagelijks het nieuwste woningaanbod van meerdere bronnen zodat je niets mist.
                {hasListings ? (
                  <>Momenteel zijn er <strong>{totalCount} {label.plural.toLowerCase()}</strong> beschikbaar{cityName ? ` in ${cityName}` : ""}.</>
                ) : (
                  <>Er zijn momenteel geen {label.plural.toLowerCase()} beschikbaar{cityName ? ` in ${cityName}` : ""}, maar het aanbod wordt dagelijks aangevuld.</>
                )}
              </p>
              {listingType === "huur" ? (
                <>
                  <p>
                    De huurwoningmarkt {cityName ? `in ${cityName}` : "in Nederland"} is competitief.
                    Veel <strong>huurwoningen{cityName ? ` in ${cityName}` : ""}</strong> zijn binnen enkele dagen verhuurd.
                    Daarom is het belangrijk om snel te reageren op nieuwe advertenties. Met Woonaanbod NL heb je een
                    voorsprong: onze scrapers doorzoeken dagelijks meerdere woningplatforms en tonen het nieuwste
                    aanbod direct op onze website.
                  </p>
                  <p>
                    Tip: stel een gratis{" "}
                    <Link to="/woonradar" className="text-primary underline hover:no-underline">
                      dagelijkse alert
                    </Link>{" "}
                    in en ontvang elke dag een overzicht van nieuwe huurwoningen
                    {cityName ? ` in ${cityName}` : ""}. Zo mis je nooit meer een kans op jouw ideale huurwoning.
                    Je kunt ook filteren op maximale huurprijs, aantal slaapkamers en woningtype om nog gerichter te zoeken.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    De koopwoningmarkt {cityName ? `in ${cityName}` : "in Nederland"} biedt kansen voor
                    zowel starters als doorstromers. Of je nu op zoek bent naar een betaalbaar <strong>appartement
                    {cityName ? ` in ${cityName}` : ""}</strong> of een ruime gezinswoning, op Woonaanbod NL vind je
                    dagelijks nieuwe koopwoningen uit meerdere bronnen.
                  </p>
                  <p>
                    Vergelijk <strong>koopwoningen{cityName ? ` in ${cityName}` : ""}</strong> op prijs, oppervlakte
                    en locatie. Sla interessante woningen op in je favorieten en ontvang alerts wanneer er nieuwe
                    koopwoningen{cityName ? ` in ${cityName}` : ""} beschikbaar komen. Zo ben je altijd als eerste
                    op de hoogte van het nieuwste aanbod.
                  </p>
                </>
              )}
              {cityName && (
                <p>
                  Naast {label.plural.toLowerCase()} vind je op Woonaanbod NL ook{" "}
                  <Link to={`/appartement/${citySlug}`} className="text-primary underline hover:no-underline">
                    appartementen in {cityName}
                  </Link>,{" "}
                  <Link to={`/huis/${citySlug}`} className="text-primary underline hover:no-underline">
                    huizen in {cityName}
                  </Link>{" "}
                  en{" "}
                  <Link to={`/studio/${citySlug}`} className="text-primary underline hover:no-underline">
                    studio's in {cityName}
                  </Link>. Vergelijk het volledige aanbod en vind de woning die bij jou past.
                </p>
              )}
            </div>

            {/* Tips block */}
            <h3 className="mt-10 font-display text-xl font-semibold text-foreground">
              Tips voor het vinden van een {label.singular} in {locationLabel}
            </h3>
            <div className="mt-3 space-y-4 text-base leading-relaxed text-muted-foreground">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Reageer snel</strong>: Nieuwe {label.plural.toLowerCase()} in {locationLabel} zijn
                  vaak snel weg. Stel een{" "}
                  <Link to="/woonradar" className="text-primary underline hover:no-underline">
                    dagelijkse alert
                  </Link>{" "}
                  in om als eerste op de hoogte te zijn.
                </li>
                <li>
                  <strong>Gebruik filters</strong>: Filter op maximale {listingType === "huur" ? "huurprijs" : "koopprijs"},
                  aantal kamers of oppervlakte om alleen relevante woningen te zien.
                </li>
                <li>
                  <strong>Bekijk ook andere woningtypes</strong>: Verbreed je zoekopdracht naar appartementen, huizen of
                  studio's om meer kans te maken.
                </li>
                <li>
                  <strong>Vergelijk prijzen</strong>: Bekijk de prijzen van vergelijkbare{" "}
                  {label.plural.toLowerCase()} in {locationLabel} om een realistisch beeld te krijgen van de markt.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Internal links */}
        {cityName && (
          <section className="border-t py-12">
            <div className="container">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Andere woningen in {cityName}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <Link
                  to={cityPath(cityName)}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Alle woningen in {cityName}
                  </span>
                </Link>
                {listingType !== "huur" && (
                  <Link
                    to={`/huren/${citySlug}`}
                    className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      Huurwoningen in {cityName}
                    </span>
                  </Link>
                )}
                {listingType !== "koop" && (
                  <Link
                    to={`/kopen/${citySlug}`}
                    className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      Koopwoningen in {cityName}
                    </span>
                  </Link>
                )}
                <Link
                  to={`/appartement/${citySlug}`}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Appartementen in {cityName}
                  </span>
                </Link>
                <Link
                  to={`/huis/${citySlug}`}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Huizen in {cityName}
                  </span>
                </Link>
                <Link
                  to={`/vandaag/${citySlug}`}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Nieuw aanbod in {cityName}
                  </span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Similar properties */}
        {citySlug && cityName && (
          <SimilarProperties
            cityName={cityName}
            excludeIds={properties.map((p) => p.id)}
          />
        )}

        {/* FAQ */}
        <section className="border-t">
          <div className="container">
            <FAQSchema
              items={faqItems}
              title={`Veelgestelde vragen over ${label.plural.toLowerCase()} in ${locationLabel}`}
            />
          </div>
        </section>

        {/* Related cities */}
        {citySlug && cityName && <RelatedCities currentCity={cityName} />}
      </main>
      <Footer />
    </div>
  );
};

export default ListingTypePage;
