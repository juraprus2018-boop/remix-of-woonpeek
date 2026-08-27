import { useTranslation } from "react-i18next";
import { L as Link } from "@/components/LocalizedLink";
import { Mail, Facebook, Linkedin, Instagram } from "lucide-react";
import Logo from "@/components/brand/Logo";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="container py-16">
        <div className="mb-12 grid gap-8 border-b border-background/15 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Link to="/" className="inline-flex items-center gap-2">
              <Logo size="h-9" variant="light" />
            </Link>
            <p className="mt-6 max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">
              {t("footer.tagline")} <span className="text-sun">{t("footer.taglineEnd")}</span>
            </p>
            <p className="mt-3 max-w-md text-sm text-background/70">
              {t("footer.intro")}
            </p>
          </div>
          <div className="flex items-end lg:col-span-5 lg:justify-end">
            <span className="rounded-full bg-sun px-4 py-2 text-xs font-bold text-foreground">
              info@woonaanbod-nl.nl · woonaanbod-nl.nl
            </span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/woning-zoeken" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkSearch")}</Link></li>
              <li><Link to="/huurwoningen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkRentals")}</Link></li>
              <li><Link to="/appartement-huren" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkApartments")}</Link></li>
              <li><Link to="/kamer-huren" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkRooms")}</Link></li>
              <li><Link to="/studio-huren" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkStudios")}</Link></li>
              <li><Link to="/woonaanbod-per-stad" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkAllCities")}</Link></li>
              <li><Link to="/vandaag" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkNew")}</Link></li>
              <li><Link to="/plaatsen-start" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkPost")}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">{t("footer.popularSearches")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/appartement-huren/amsterdam" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("nav.categories.apartments")} Amsterdam</Link></li>
              <li><Link to="/huurwoningen/rotterdam" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("nav.categories.rentals")} Rotterdam</Link></li>
              <li><Link to="/appartement-huren/utrecht" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("nav.categories.apartments")} Utrecht</Link></li>
              <li><Link to="/kamer-huren/eindhoven" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("nav.categories.rooms")} Eindhoven</Link></li>
              <li><Link to="/aanbod-in/den-haag/onder-1000" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Den Haag &lt; €1.000</Link></li>
              <li><Link to="/huurwoningen/groningen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("nav.categories.rentals")} Groningen</Link></li>
              <li><Link to="/woonradar" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkAlert")}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">Tools &amp; Diensten</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/woningmarkt" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Woningmarktcijfers</Link></li>
              <li><Link to="/energie" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Energie vergelijken</Link></li>
              <li><Link to="/internet" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Internet &amp; TV vergelijken</Link></li>
              <li><Link to="/verhuisservice" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Verhuisservice</Link></li>
              <li><Link to="/woz-waarde" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">WOZ-waarde opzoeken</Link></li>
              <li><Link to="/hypotheek-berekenen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Hypotheek berekenen</Link></li>
              <li><Link to="/budgetcheck" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Budgetcheck</Link></li>
              <li><Link to="/woningmarkt" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Huurprijsmonitor</Link></li>
              <li><Link to="/verhuischecklist" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Verhuischecklist</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vragen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkFAQ")}</Link></li>
              <li><Link to="/voorwaarden" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkTerms")}</Link></li>
              <li><Link to="/privacy" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkPrivacy")}</Link></li>
              <li><Link to="/disclaimer" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkDisclaimer")}</Link></li>
              <li><Link to="/over" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkAbout")}</Link></li>
              <li><Link to="/samenwerken" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkPartner")}</Link></li>
              <li><Link to="/budgetcheck" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">{t("footer.linkBudget")}</Link></li>
              <li><Link to="/transparantie" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Transparantie</Link></li>
              <li><Link to="/woordenboek" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Woordenboek</Link></li>
              <li><a href="/feed.xml" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">RSS feed</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">{t("footer.contact")}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-background/80">
                <Mail className="h-4 w-4" />
                info@woonaanbod-nl.nl
              </li>
              <li>
                <a href="https://www.facebook.com/profile.php?id=61593864421175" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/woonaanbod-nl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/woonaanbod-nl/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t-2 border-background/30 pt-6">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-background">{t("footer.perCity")}</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-background/70">
            {[
              "Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven",
              "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen",
              "Arnhem", "Haarlem", "Leiden", "Maastricht", "Delft",
              "Zwolle", "Apeldoorn", "Amersfoort"
            ].map((city) => (
              <Link key={city} to={`/stad/${city.toLowerCase().replace(/\s+/g, "-")}`} className="transition-colors hover:text-background hover:underline underline-offset-4">
                {city}
              </Link>
            ))}
            <Link to="/woonaanbod-per-stad" className="font-semibold text-background transition-colors hover:underline">
              {t("footer.allCitiesArrow")}
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t-2 border-background/30 pt-6">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-background/70">
            © {new Date().getFullYear()} Woonaanbod NL. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
