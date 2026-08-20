import { Link } from "react-router-dom";

const SEOContentSection = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl space-y-6 text-base md:text-lg leading-relaxed text-muted-foreground">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Huurwoning zoeken in Nederland
          </h2>
          <p>
            Op zoek naar een <strong>huurwoning</strong>? Bij Woonaanbod NL zet je je zoektocht
            in vijf minuten op de rails. Wij verzamelen elke dag verse{" "}
            <Link to="/huren" className="text-primary hover:underline">huurwoningen</Link>,{" "}
            <Link to="/appartement" className="text-primary hover:underline">appartementen</Link>,{" "}
            <Link to="/studio" className="text-primary hover:underline">studio's</Link> en{" "}
            <Link to="/kamer" className="text-primary hover:underline">kamers</Link> op één plek.
            Of je nu starter bent, student of toe aan iets groters: hier vind je wat past.
          </p>
          <p>
            Wij doorlopen meerdere verhuurplatforms en makelaars zodat jij niks mist.
            Filter op stad, prijs, type en kamers en zie meteen de meest relevante{" "}
            <Link to="/vinden" className="text-primary hover:underline">huurwoningen</Link>.
            De drukste steden zijn{" "}
            <Link to="/huurwoningen/amsterdam" className="text-primary hover:underline">Amsterdam</Link>,{" "}
            <Link to="/huurwoningen/rotterdam" className="text-primary hover:underline">Rotterdam</Link>,{" "}
            <Link to="/huurwoningen/utrecht" className="text-primary hover:underline">Utrecht</Link>,{" "}
            <Link to="/huurwoningen/den-haag" className="text-primary hover:underline">Den Haag</Link> en{" "}
            <Link to="/huurwoningen/eindhoven" className="text-primary hover:underline">Eindhoven</Link>.
            Het hele lijstje staat op de{" "}
            <Link to="/plekken" className="text-primary hover:underline">stedenpagina</Link>.
          </p>
          <p>
            Zet onze gratis{" "}
            <Link to="/woonradar" className="text-primary hover:underline">dagelijkse alert</Link>{" "}
            aan en krijg automatisch een mail wanneer er iets binnenkomt dat klopt.
            Check ook even het{" "}
            <Link to="/vandaag" className="text-primary hover:underline">nieuw aanbod van vandaag</Link>{" "}
            of de{" "}
            <Link to="/budgetcheck" className="text-primary hover:underline">budget tool</Link>{" "}
            om te zien wat je kunt betalen. Favorieten opslaan, prijzen vergelijken
            en sneller reageren dan de rest, je doet het hier.
          </p>
          <p>
            Check de{" "}
            <Link to="/huurprijsmonitor" className="text-primary hover:underline">huurprijsmonitor</Link>{" "}
            voor wat normaal is per stad. Begin vandaag met{" "}
            <strong>huren zoeken</strong> op Woonaanbod NL. Echt gratis.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SEOContentSection;
