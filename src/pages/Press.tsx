import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, Phone, BarChart3 } from "lucide-react";
import { PRESS_KIND_LABEL, formatDateNL, usePressContact } from "@/lib/press";

const Press = () => {
  const { data: contact } = usePressContact();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["press-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_releases")
        .select("slug, kind, title, summary, city_name, reference_date, sample_size, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Pers: huurcijfers en onderzoek | Woonaanbod NL"
        description="Persberichten, de maandelijkse Woonaanbod Huurmonitor en lokale huurcijfers per stad. Met grafieken, downloadbare cijfers en bronvermelding."
        canonical="/pers"
      />
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pers" }]} />
            <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">Pers en onderzoek</h1>
            <p className="mt-3 text-muted-foreground">
              Woonaanbod NL verzamelt dagelijks het huuraanbod van eigen adverteerders, makelaars, woningcorporaties en partnersites.
              Op basis daarvan publiceren we iedere maand de Woonaanbod Huurmonitor en iedere week een lokale update. Cijfers mogen vrij worden
              gebruikt met bronvermelding "Woonaanbod NL" en een link naar de publicatie.
            </p>
          </div>
        </section>

        <section className="container grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-4 font-display text-2xl font-bold">Onderzoeken en nieuwsberichten</h2>
            {isLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl border bg-card" />)}</div>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">Er zijn nog geen publicaties.</p>
            ) : (
              <div className="space-y-4">
                {items.map((p) => (
                  <article key={p.slug} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={p.kind === "landelijk" ? "default" : "secondary"}>{PRESS_KIND_LABEL[p.kind]}</Badge>
                      {p.city_name && p.kind === "lokaal" && <span>{p.city_name}</span>}
                      <span>{formatDateNL(p.published_at)}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold">
                      <Link to={`/pers/${p.slug}`} className="hover:text-primary hover:underline">{p.title}</Link>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
                    <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <BarChart3 className="h-3.5 w-3.5" /> {p.sample_size.toLocaleString("nl-NL")} woningen onderzocht, peildatum {formatDateNL(p.reference_date)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">Perscontact</h2>
              {contact && (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-medium">{contact.name}</p>
                  {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-primary hover:underline"><Mail className="h-4 w-4" />{contact.email}</a>}
                  {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-primary hover:underline"><Phone className="h-4 w-4" />{contact.phone}</a>}
                </div>
              )}
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">Logo downloaden</h2>
              <img src="/pers/woonaanbod-nl-logo.svg" alt="Logo Woonaanbod NL" className="mt-3 w-full rounded border" />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline"><a href="/pers/woonaanbod-nl-logo.svg" download><Download className="mr-1 h-4 w-4" />SVG</a></Button>
                <Button asChild size="sm" variant="outline"><a href="/icon-512.png" download="woonaanbod-nl-icoon.png"><Download className="mr-1 h-4 w-4" />Icoon PNG</a></Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
              <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Over onze cijfers</h2>
              Alle cijfers komen uit de eigen database van Woonaanbod NL en beschrijven het door ons gevolgde aanbod, niet automatisch de volledige huurmarkt.
              Iedere publicatie vermeldt peildatum, aantal woningen en methode. Gepubliceerde cijfers worden niet achteraf aangepast.
              Meer actuele cijfers vind je op <Link to="/woningmarkt" className="text-primary hover:underline">Woningmarkt in cijfers</Link>.
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Press;
