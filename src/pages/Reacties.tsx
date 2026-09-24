import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { MessageCircle, User, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { propertyPath } from "@/lib/propertyUrl";

const Reacties = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-property-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_comments")
        .select("id, name, content, created_at, properties(id, title, city, listing_type, slug, address_slug)")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Reacties van woningzoekers | Woonaanbod NL"
        description="Lees wat andere woningzoekers schrijven over woningen op Woonaanbod NL. Ervaringen, vragen en tips bij het actuele aanbod."
        canonical="/reacties"
      />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reacties" }]} />
            <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">Reacties van woningzoekers</h1>
            <p className="mt-3 text-muted-foreground">
              Lees wat anderen schrijven over woningen uit ons aanbod. Klik op een woning om hem te bekijken of zelf te reageren.
            </p>
          </div>
        </section>
        <section className="container py-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {data.map((c: any) => (
                <article key={c.id} className="rounded-xl border bg-card p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: nl })}
                      </p>
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{c.content}</p>
                  {c.properties && (
                    <Link
                      to={propertyPath(c.properties)}
                      className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium text-primary hover:underline"
                    >
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{c.properties.title}{c.properties.city ? `, ${c.properties.city}` : ""}</span>
                    </Link>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed py-16 text-center">
              <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Er zijn nog geen reacties. Reageer als eerste op een woning!</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Reacties;
