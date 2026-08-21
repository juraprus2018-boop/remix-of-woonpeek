import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import PropertyCard from "@/components/properties/PropertyCard";
import { realtorSlug } from "@/lib/realtorSlug";
import { Star, Phone, Globe, MapPin, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MakelaarPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();

  const { data: realtor, isLoading } = useQuery({
    queryKey: ["realtor-by-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("city_realtors")
        .select("*")
        .limit(2000);
      if (error) throw error;
      return data?.find((r) => realtorSlug(r.name, r.city) === slug) ?? null;
    },
  });

  const { data: listings } = useQuery({
    queryKey: ["realtor-listings", realtor?.name, realtor?.city],
    enabled: !!realtor,
    queryFn: async () => {
      if (!realtor) return [];
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "actief")
        .ilike("source_site", `%${realtor.name.split(" ")[0]}%`)
        .limit(24);
      if (data && data.length > 0) return data;
      const { data: cityData } = await supabase
        .from("properties")
        .select("*")
        .eq("city", realtor.city)
        .eq("status", "actief")
        .order("feed_priority", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(12);
      return cityData ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-16"><Skeleton className="h-64 w-full" /></main>
        <Footer />
      </div>
    );
  }

  if (!realtor) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEOHead title="Makelaar niet gevonden | Woonaanbod NL" description="Deze makelaar bestaat niet of is verwijderd." noindex />
        <Header />
        <main className="flex-1 container py-24 text-center">
          <h1 className="font-display text-4xl lowercase">makelaar niet gevonden</h1>
          <Link to="/woonaanbod-per-stad" className="mt-6 inline-block underline">Bekijk alle steden</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const verified = (realtor.rating ?? 0) >= 4 && (realtor.reviews_count ?? 0) >= 10;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={`${realtor.name} - Makelaar in ${realtor.city} | Woonaanbod NL`}
        description={`Aanbod, contactgegevens en reviews van ${realtor.name} in ${realtor.city}. ${realtor.reviews_count ?? 0} Google reviews, gemiddeld ${realtor.rating ?? "-"}/5.`}
        canonical={`/makelaar/${slug}`}
      />
      <Header />
      <main className="flex-1">
        <section className="border-b-2 border-foreground bg-sage">
          <div className="container py-12 md:py-20">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-5">
                {realtor.photo_url && (
                  <img src={realtor.photo_url} alt={realtor.name} className="h-20 w-20 rounded-full border-2 border-foreground object-cover" />
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/70">Makelaar in {realtor.city}</p>
                  <h1 className="mt-2 font-display text-4xl lowercase md:text-6xl">{realtor.name}</h1>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-foreground/80">
                    {realtor.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-accent" />
                        <strong>{realtor.rating}</strong> ({realtor.reviews_count ?? 0} reviews)
                      </span>
                    )}
                    {verified && (
                      <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-background">
                        <ShieldCheck className="h-3.5 w-3.5" /> Geverifieerd
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                {realtor.address && <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {realtor.address}</span>}
                {realtor.phone && <a href={`tel:${realtor.phone}`} className="flex items-center gap-2 hover:underline"><Phone className="h-4 w-4" /> {realtor.phone}</a>}
                {realtor.website && <a href={realtor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><Globe className="h-4 w-4" /> Website</a>}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground">
          <div className="container py-12">
            <h2 className="font-display text-2xl lowercase md:text-3xl">aanbod {listings && listings.length > 0 ? `(${listings.length})` : ""}</h2>
            {listings && listings.length > 0 ? (
              <div className="mt-8 flex flex-col gap-5">
                {listings.map((p) => <PropertyCard key={p.id} property={p} />)}
              </div>
            ) : (
              <p className="mt-6 text-foreground/70">Geen actief aanbod gevonden van deze makelaar. Bekijk <Link className="underline" to={`/stad/${realtor.city.toLowerCase()}`}>alle woningen in {realtor.city}</Link>.</p>
            )}
          </div>
        </section>

        <section>
          <div className="container py-12 text-sm text-foreground/70">
            <p>Ben je {realtor.name} en wil je je profiel claimen of aanvullen? Mail naar <a className="underline" href="mailto:info@woonaanbod-nl.nl">info@woonaanbod-nl.nl</a>.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MakelaarPage;
