import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Globe, MapPin, Phone, Mail } from "lucide-react";
import { PUBLIC_AGENCY_COLUMNS, logAgencyEvent, safeWebsite, type Agency } from "@/lib/agency";
import { CANONICAL_URL } from "@/lib/brand";
import NotFound from "./NotFound";

const AgencyPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();

  const { data: agency, isLoading } = useQuery({
    queryKey: ["agency", slug],
    queryFn: async () => {
      const { data } = await supabase.from("agencies").select(PUBLIC_AGENCY_COLUMNS).eq("slug", slug).maybeSingle();
      return data as unknown as Agency | null;
    },
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["agency-listings", agency?.id],
    enabled: !!agency?.id,
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").eq("agency_id", agency!.id)
        .eq("status", "actief").order("created_at", { ascending: false }).limit(60);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (agency?.id) logAgencyEvent(agency.id, "view");
  }, [agency?.id]);

  if (isLoading) return <div className="container py-20"><Skeleton className="h-40 w-full" /></div>;
  if (!agency) return <NotFound />;

  const website = safeWebsite(agency.website);
  const url = `${CANONICAL_URL}/makelaars/${agency.slug}`;
  const title = `${agency.name}${agency.city ? ` ${agency.city}` : ""}: actueel woningaanbod | Woonaanbod NL`;
  const desc = (agency.description?.slice(0, 140) || `Bekijk het actuele woningaanbod van ${agency.name}${agency.city ? ` in ${agency.city}` : ""}.`) + ` ${listings.length} woningen beschikbaar.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agency.name,
    url,
    ...(agency.logo_url ? { logo: agency.logo_url, image: agency.logo_url } : {}),
    ...(agency.description ? { description: agency.description } : {}),
    ...(agency.phone ? { telephone: agency.phone } : {}),
    ...(agency.email ? { email: agency.email } : {}),
    ...(website ? { sameAs: [website] } : {}),
    ...(agency.city ? { address: { "@type": "PostalAddress", addressLocality: agency.city, addressCountry: "NL" } } : {}),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead title={title} description={desc} canonical={`/makelaars/${agency.slug}`} ogImage={agency.logo_url || undefined} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="container flex-1 py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Makelaars", href: "/makelaars" }, { label: agency.name }]} />
        <section className="mt-4 flex flex-col gap-6 rounded-lg border bg-card p-6 md:flex-row md:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
            {agency.logo_url ? <img src={agency.logo_url} alt={`Logo ${agency.name}`} className="h-full w-full object-contain" /> : <Building2 className="h-10 w-10 text-muted-foreground" />}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-foreground">{agency.name}</h1>
            {agency.city && <p className="mt-1 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{agency.city}</p>}
            {agency.description && <p className="mt-3 max-w-3xl whitespace-pre-line text-foreground">{agency.description}</p>}
          </div>
          <div className="flex flex-col gap-2">
            {website && (
              <Button asChild className="gap-2" onClick={() => logAgencyEvent(agency.id, "click")}>
                <a href={website} target="_blank" rel="noopener">{<Globe className="h-4 w-4" />}Website</a>
              </Button>
            )}
            {agency.phone && (
              <Button asChild variant="outline" className="gap-2" onClick={() => logAgencyEvent(agency.id, "click")}>
                <a href={`tel:${agency.phone}`}><Phone className="h-4 w-4" />{agency.phone}</a>
              </Button>
            )}
            {agency.email && (
              <Button asChild variant="outline" className="gap-2" onClick={() => logAgencyEvent(agency.id, "click")}>
                <a href={`mailto:${agency.email}`}><Mail className="h-4 w-4" />E-mail</a>
              </Button>
            )}
          </div>
        </section>

        <h2 className="mt-10 font-display text-2xl font-semibold text-foreground">
          Actueel aanbod{listings.length > 0 ? ` (${listings.length})` : ""}
        </h2>
        {listings.length > 0 ? (
          <div className="mt-4 space-y-4">{listings.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
        ) : (
          <p className="mt-3 text-muted-foreground">Er staat op dit moment geen aanbod online van {agency.name}.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AgencyPage;
