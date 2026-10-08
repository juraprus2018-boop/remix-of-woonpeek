import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Handshake } from "lucide-react";

const PARTNERS = [
  { name: "Huurzone", tagline: "Landelijk aanbod van huurwoningen en appartementen" },
  { name: "Huurwoningen", tagline: "Breed aanbod van particuliere en professionele verhuurders" },
  { name: "Kamernet", tagline: "Specialist in kamers, studio's en gedeelde woonruimte" },
  { name: "DirectWonen", tagline: "Direct beschikbare huurwoningen in heel Nederland" },
  { name: "Huurstunt", tagline: "Dagelijks actueel aanbod van makelaars en verhuurders" },
  { name: "Renthunter", tagline: "Huurwoningen verzameld uit heel Nederland" },
];

const Samenwerking = () => {

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Samenwerking – Onze partners | Woonaanbod NL"
        description="Woonaanbod NL werkt samen met toonaangevende woningplatformen in Nederland. Bekijk onze partners en aanbieders."
        canonical="/samenwerken"
      />
      <Header />
      <main className="flex-1">
        <div className="border-b bg-primary text-primary-foreground">
          <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="font-medium">Makelaar of verhuurder? Plaats je volledige woningaanbod gratis op Woonaanbod NL.</p>
            <Link to="/voor-makelaars" className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">Plaats je woningaanbod gratis</Link>
          </div>
        </div>
        {/* Hero */}
        <section className="border-b bg-muted/30 py-12 md:py-16">
          <div className="container text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Handshake className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Onze partners &amp; aanbieders
            </h1>
            <p className="mt-3 text-muted-foreground">
              Woonaanbod NL werkt samen met betrouwbare woningplatformen in heel Nederland.
              Via ons partnernetwerk verzamelen we dagelijks het nieuwste woningaanbod,
              zodat jij alles op één plek kunt vinden.
            </p>
          </div>
        </section>

        {/* Partners grid */}
        <section className="py-12 md:py-16">
          <div className="container">
            <h2 className="font-display mb-8 text-center text-2xl font-bold text-foreground">
              Aangesloten aanbieders
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PARTNERS.map((p) => (
                <div
                  key={p.name}
                  className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-center shadow-sm"
                >
                  <div className="flex h-16 w-full items-center justify-center rounded-lg bg-primary/5">
                    <span className="font-display text-2xl font-extrabold tracking-tight text-primary">
                      {p.name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="border-t bg-muted/30 py-12">
          <div className="container space-y-6 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Hoe werkt onze samenwerking?
            </h2>
            <p>
              Woonaanbod NL werkt samen met diverse woningplatformen en aanbieders in heel Nederland.
              Dankzij ons partnernetwerk verzamelen we dagelijks duizenden woningen en tonen
              we deze op één overzichtelijke plek.
            </p>
            <p>
              Elke partner levert een datafeed met actueel woningaanbod. Onze systemen
              verwerken deze feeds automatisch, zodat je als bezoeker altijd het meest
              recente aanbod ziet, zonder zelf tientallen websites af te hoeven zoeken.
            </p>
            <h3 className="font-display pt-2 text-xl font-semibold text-foreground">
              Zelf samenwerken met Woonaanbod NL?
            </h3>
            <p>
              Ben je een woningplatform of makelaar en wil je jouw aanbod op Woonaanbod NL tonen?
              Neem dan contact met ons op via{" "}
              <a href="mailto:info@woonaanbod-nl.nl" className="font-medium text-primary underline underline-offset-2">
                info@woonaanbod-nl.nl
              </a>{" "}
              of bekijk onze{" "}
              <a href="/makelaar-koppelen" className="font-medium text-primary underline underline-offset-2">
                makelaar-koppeling
              </a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Samenwerking;
