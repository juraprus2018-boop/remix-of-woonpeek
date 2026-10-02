import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Building2, MapPin } from "lucide-react";
import { PUBLIC_AGENCY_COLUMNS, type Agency } from "@/lib/agency";

const AgenciesList = () => {
  const { data: agencies = [] } = useQuery({
    queryKey: ["agencies-public"],
    queryFn: async () => {
      const { data } = await supabase.from("agencies").select(PUBLIC_AGENCY_COLUMNS).eq("is_visible", true).order("name");
      return (data ?? []) as unknown as Agency[];
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead title="Aangesloten makelaars en verhuurders | Woonaanbod NL" description="Overzicht van makelaars en verhuurders die hun volledige woningaanbod op Woonaanbod NL tonen, met actueel aanbod per kantoor." />
      <Header />
      <main className="container flex-1 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Aangesloten makelaars</h1>
            <p className="mt-2 text-muted-foreground">Kantoren die hun aanbod rechtstreeks en dagelijks bijgewerkt op Woonaanbod NL tonen.</p>
          </div>
          <Button asChild><Link to="/voor-makelaars">Ben je makelaar? Sluit gratis aan</Link></Button>
        </div>
        {agencies.length === 0 ? (
          <p className="mt-10 text-muted-foreground">Nog geen aangesloten makelaars. Word de eerste via <Link to="/voor-makelaars" className="text-primary underline">gratis aansluiten</Link>.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((a) => (
              <Link key={a.id} to={`/makelaars/${a.slug}`} className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border bg-background">
                  {a.logo_url ? <img src={a.logo_url} alt="" className="h-full w-full object-contain" loading="lazy" /> : <Building2 className="h-7 w-7 text-muted-foreground" />}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{a.name}</div>
                  {a.city && <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{a.city}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AgenciesList;
