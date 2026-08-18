import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StockBanner from "@/components/layout/StockBanner";
import SEOHead from "@/components/seo/SEOHead";

const Disclaimer = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Disclaimer | Woonaanbod NL"
        description="Informatie over de juistheid van woningaanbod, aansprakelijkheid en externe bronnen op Woonaanbod NL."
        canonical="https://www.woonaanbod-nl.nl/disclaimer"
      />
      <Header />

      <main className="flex-1">
        <StockBanner
          seed="disclaimer-woonaanbod-nl"
          eyebrow="Juridisch"
          title="Disclaimer"
          subtitle="Laatst bijgewerkt: 13 februari 2026"
        />
        <div className="container py-12">


        <div className="mt-8 space-y-8 text-foreground/90">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Geen garantie op juistheid</h2>
            <p className="leading-relaxed text-muted-foreground">
              De informatie op Woonaanbod NL wordt met de grootst mogelijke zorg samengesteld. Desondanks kunnen wij niet garanderen 
              dat alle informatie altijd juist, volledig en actueel is. Woninginformatie wordt deels automatisch verzameld van 
              externe bronnen en kan afwijken van de werkelijkheid.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Geen partij bij transacties</h2>
            <p className="leading-relaxed text-muted-foreground">
              Woonaanbod NL is uitsluitend een informatieplatform en is geen partij bij overeenkomsten die tot stand komen 
              tussen gebruikers onderling. Woonaanbod NL treedt niet op als makelaar, bemiddelaar of adviseur.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Externe bronnen</h2>
            <p className="leading-relaxed text-muted-foreground">
              Woonaanbod NL verzamelt woningaanbod van diverse externe websites. Wij zijn niet verantwoordelijk voor de inhoud, 
              beschikbaarheid of het privacybeleid van deze externe bronnen. Controleer de informatie altijd bij de originele bron.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Aansprakelijkheid</h2>
            <p className="leading-relaxed text-muted-foreground">
              Woonaanbod NL is niet aansprakelijk voor enige directe of indirecte schade die voortvloeit uit het gebruik van het platform, 
              waaronder maar niet beperkt tot financiële schade, gemiste kansen of onjuiste beslissingen op basis van de getoonde informatie.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Wijzigingen</h2>
            <p className="leading-relaxed text-muted-foreground">
              Woonaanbod NL behoudt zich het recht voor om deze disclaimer op elk moment te wijzigen. 
              Het is de verantwoordelijkheid van de gebruiker om regelmatig te controleren of er wijzigingen zijn doorgevoerd.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
            <p className="leading-relaxed text-muted-foreground">
              Heb je vragen over deze disclaimer? Neem dan contact met ons op via{" "}
              <strong>info@woonaanbod-nl.nl</strong>.
            </p>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </div>

  );
};

export default Disclaimer;
