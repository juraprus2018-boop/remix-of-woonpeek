import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StockBanner from "@/components/layout/StockBanner";
import SEOHead from "@/components/seo/SEOHead";

const TermsAndConditions = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Algemene voorwaarden | Huurbaasje"
        description="De algemene voorwaarden van Huurbaasje. Regels voor het gebruik van ons platform, advertenties, aansprakelijkheid en intellectueel eigendom."
        canonical="https://www.huurbaasje.nl/algemene-voorwaarden"
      />
      <Header />

      <main className="flex-1">
        <StockBanner
          seed="algemene-voorwaarden-huurbaasje"
          eyebrow="Juridisch"
          title="Algemene voorwaarden"
          subtitle="Laatst bijgewerkt: 13 februari 2026"
        />
        <div className="container max-w-3xl py-12">


        <div className="mt-8 space-y-8 text-foreground/90">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">1. Definities</h2>
            <p className="leading-relaxed text-muted-foreground">
              In deze algemene voorwaarden wordt verstaan onder: <strong>Huurbaasje</strong>: het online woningplatform bereikbaar via huurbaasje.nl; 
              <strong> Gebruiker</strong>: iedere bezoeker of geregistreerde gebruiker van Huurbaasje; 
              <strong> Adverteerder</strong>: een gebruiker die een woning aanbiedt via Huurbaasje.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">2. Toepasselijkheid</h2>
            <p className="leading-relaxed text-muted-foreground">
              Deze voorwaarden zijn van toepassing op elk gebruik van Huurbaasje. Door het platform te gebruiken, ga je akkoord met deze voorwaarden. 
              Huurbaasje behoudt zich het recht voor om deze voorwaarden te wijzigen.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">3. Gebruik van het platform</h2>
            <p className="leading-relaxed text-muted-foreground">
              Huurbaasje is een platform dat woningaanbod verzamelt en toont. Gebruikers kunnen woningen zoeken, opslaan en aanbieden. 
              Het is niet toegestaan om het platform te gebruiken voor illegale of misleidende doeleinden.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">4. Advertenties en inhoud</h2>
            <p className="leading-relaxed text-muted-foreground">
              Adverteerders zijn zelf verantwoordelijk voor de juistheid en volledigheid van de geplaatste woninginformatie. 
              Huurbaasje behoudt zich het recht voor om advertenties te verwijderen die in strijd zijn met deze voorwaarden of de wet.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">5. Intellectueel eigendom</h2>
            <p className="leading-relaxed text-muted-foreground">
              Alle content op Huurbaasje, inclusief teksten, afbeeldingen, logo's en software, is eigendom van Huurbaasje of haar licentiegevers. 
              Het is niet toegestaan om deze content te kopiëren of te verspreiden zonder schriftelijke toestemming.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">6. Aansprakelijkheid</h2>
            <p className="leading-relaxed text-muted-foreground">
              Huurbaasje is een bemiddelingsplatform en is niet aansprakelijk voor de inhoud van advertenties, transacties tussen gebruikers, 
              of schade die voortvloeit uit het gebruik van het platform. Huurbaasje garandeert niet dat de informatie op het platform altijd 
              juist, volledig of actueel is.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">7. Privacy</h2>
            <p className="leading-relaxed text-muted-foreground">
              Huurbaasje verwerkt persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG). 
              Zie ons <a href="/privacy" className="text-primary underline hover:text-primary/80">privacybeleid</a> voor meer informatie.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">8. Toepasselijk recht</h2>
            <p className="leading-relaxed text-muted-foreground">
              Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Amsterdam.
            </p>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </div>

  );
};

export default TermsAndConditions;
