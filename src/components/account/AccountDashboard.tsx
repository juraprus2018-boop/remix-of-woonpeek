import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PropertyCard from "@/components/properties/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { useFavorites } from "@/hooks/useFavorites";
import { trackDaisyconClick } from "@/hooks/usePageTracking";
import { Bell, Heart, Zap, ExternalLink, Plug, Wifi, Calculator } from "lucide-react";

const useHuurzoneLink = () =>
  useQuery({
    queryKey: ["huurzone-link"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("daisycon_banners")
        .select("click_url")
        .ilike("advertiser_name", "huurzone%")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      return (data?.click_url as string | undefined) ?? null;
    },
    staleTime: 30 * 60 * 1000,
  });

const AccountDashboard = ({ name }: { name: string }) => {
  const { data: huurzone } = useHuurzoneLink();
  const { data: recent } = useProperties({ listingType: "huur", pageSize: 6, sortBy: "newest" });
  const { data: favorites } = useFavorites();
  const items = recent?.properties ?? [];

  const openHuurzone = () => {
    if (!huurzone) return;
    trackDaisyconClick(null as any, huurzone, "huurzone.nl");
    window.open(huurzone, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Welkom terug, {name}</h1>
        <p className="mt-1 text-muted-foreground">Alles om sneller een huurwoning te vinden op één plek.</p>
      </div>

      <Card className="border-2 border-primary bg-primary text-primary-foreground">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 font-display text-xl font-bold">
              <Zap className="h-5 w-5" /> Direct bezichtigen zonder wachttijd
            </p>
            <p className="mt-1 text-primary-foreground/80">
              Via Huurzone reageer je direct op woningen van particuliere verhuurders.
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-primary-foreground/60">Advertentie</p>
          </div>
          <Button size="lg" variant="secondary" className="shrink-0 font-bold" onClick={openHuurzone} disabled={!huurzone}>
            Bekijk woningen op Huurzone <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/opgeslagen">
          <Card className="h-full transition-colors hover:border-primary">
            <CardContent className="flex items-center gap-3 p-5">
              <Heart className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold">Mijn favorieten</p>
                <p className="text-sm text-muted-foreground">{favorites?.length ?? 0} opgeslagen woningen</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/woonmelding">
          <Card className="h-full transition-colors hover:border-primary">
            <CardContent className="flex items-center gap-3 p-5">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold">Woonmelding</p>
                <p className="text-sm text-muted-foreground">Gratis mail bij nieuw aanbod in jouw stad</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {items.length > 0 && (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold">Nieuwste huurwoningen</h2>
            <Link to="/vandaag" className="text-sm font-semibold text-primary hover:underline">Alles bekijken</Link>
          </div>
          <div className="space-y-3">
            {items.slice(0, 6).map((p: any) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-xl font-bold">Alvast geregeld voor je verhuizing</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { to: "/energie", icon: Plug, t: "Energie vergelijken", d: "Bespaar op je eerste jaar" },
            { to: "/internet", icon: Wifi, t: "Internet & TV", d: "Direct online in je nieuwe huis" },
            { to: "/budgetcheck", icon: Calculator, t: "Budgetcheck", d: "Welke huur past bij je inkomen?" },
          ].map(({ to, icon: Icon, t, d }) => (
            <Link key={to} to={to}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="p-5">
                  <Icon className="mb-2 h-6 w-6 text-primary" />
                  <p className="font-semibold">{t}</p>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AccountDashboard;
