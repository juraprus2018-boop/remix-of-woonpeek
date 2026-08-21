import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StockBanner from "@/components/layout/StockBanner";
import SEOHead from "@/components/seo/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Privacybeleid | Woonaanbod NL"
        description="Lees hoe Woonaanbod NL persoonsgegevens verzamelt, gebruikt en beschermt. Inzage, correctie en verwijdering volgens de AVG."
        canonical="/privacybeleid"
      />
      <Header />

      <main className="flex-1">
        <StockBanner
          seed="privacybeleid-woonaanbod-nl"
          eyebrow="Juridisch"
          title="Privacybeleid"
          subtitle="Laatst bijgewerkt: 13 februari 2026"
        />
        <div className="container py-12">


        <div className="mt-8 space-y-8 text-foreground/90">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">1. Wie zijn wij?</h2>
            <p className="leading-relaxed text-muted-foreground">
              Woonaanbod NL is een online woningplatform dat woningaanbod verzamelt en beschikbaar stelt. 
              Wij hechten groot belang aan de bescherming van jouw persoonsgegevens.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">2. Welke gegevens verzamelen wij?</h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Accountgegevens: e-mailadres, wachtwoord (versleuteld)</li>
              <li>Profielgegevens: naam, telefoonnummer (optioneel)</li>
              <li>Gebruiksgegevens: zoekgedrag, bekeken woningen, favorieten</li>
              <li>Technische gegevens: IP-adres, browsertype, apparaatinformatie</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">3. Waarvoor gebruiken wij deze gegevens?</h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Het aanbieden en verbeteren van onze diensten</li>
              <li>Het versturen van zoekalerts en notificaties</li>
              <li>Het analyseren van platformgebruik voor verbeteringen</li>
              <li>Het naleven van wettelijke verplichtingen</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">4. Delen van gegevens</h2>
            <p className="leading-relaxed text-muted-foreground">
              Wij delen jouw persoonsgegevens niet met derden, tenzij dit noodzakelijk is voor de dienstverlening 
              (bijv. hostingproviders) of wij hiertoe wettelijk verplicht zijn.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">5. Bewaartermijn</h2>
            <p className="leading-relaxed text-muted-foreground">
              Wij bewaren je gegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld. 
              Accountgegevens worden verwijderd wanneer je jouw account opheft.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">6. Jouw rechten</h2>
            <p className="leading-relaxed text-muted-foreground">
              Je hebt het recht op inzage, correctie en verwijdering van je persoonsgegevens. 
              Ook kun je bezwaar maken tegen de verwerking of een klacht indienen bij de Autoriteit Persoonsgegevens. 
              Neem contact met ons op via <strong>privacy@woonaanbod-nl.nl</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">7. Cookies</h2>
            <p className="leading-relaxed text-muted-foreground">
              Woonaanbod NL maakt gebruik van functionele cookies om het platform goed te laten werken. 
              Analytische cookies worden alleen geplaatst met jouw toestemming.
            </p>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

