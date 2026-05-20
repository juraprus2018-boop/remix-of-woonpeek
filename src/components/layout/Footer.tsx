import { Link } from "react-router-dom";
import { Mail, Facebook, Linkedin, Instagram } from "lucide-react";
import Logo from "@/components/brand/Logo";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="container py-16">
        {/* Editorial top strip */}
        <div className="mb-12 grid gap-8 border-b border-background/15 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Link to="/" className="inline-flex items-center gap-2">
              <Logo size="h-9" variant="light" />
            </Link>
            <p className="mt-6 max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">
              Vind jouw <span className="text-sun">woning.</span>
            </p>
            <p className="mt-3 max-w-md text-sm text-background/70">
              Eén rustige plek voor het nieuwste huur- en koopaanbod in heel Nederland.
              Dagelijks vers, altijd gratis.
            </p>
          </div>
          <div className="flex items-end lg:col-span-5 lg:justify-end">
            <span className="rounded-full bg-sun px-4 py-2 text-xs font-bold text-foreground">
              info@huurbaasje.nl · huurbaasje.nl
            </span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand quick block reused as fallback */}
          <div className="space-y-4 lg:hidden">
            <p className="text-sm text-muted-foreground">
              Vind jouw droomwoning of plaats je eigen woning op Huurbaasje.
              Eenvoudig, snel en betrouwbaar.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">Snelle links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/zoeken" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Woningen zoeken</Link></li>
              <li><Link to="/huurwoningen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Huurwoningen</Link></li>
              <li><Link to="/koopwoningen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Koopwoningen</Link></li>
              <li><Link to="/appartementen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Appartementen</Link></li>
              <li><Link to="/kamers" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Kamers</Link></li>
              <li><Link to="/steden" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Alle steden</Link></li>
              <li><Link to="/nieuw-aanbod" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Nieuw aanbod</Link></li>
              <li><Link to="/woning-plaatsen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Woning plaatsen</Link></li>
              <li><Link to="/blog" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Blog</Link></li>
            </ul>
          </div>

          {/* Popular searches */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">Populaire zoekopdrachten</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/appartementen/amsterdam" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Appartementen Amsterdam</Link></li>
              <li><Link to="/huurwoningen/rotterdam" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Huurwoningen Rotterdam</Link></li>
              <li><Link to="/appartementen/utrecht" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Appartementen Utrecht</Link></li>
              <li><Link to="/kamers/eindhoven" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Kamers Eindhoven</Link></li>
              <li><Link to="/woningen/den-haag/onder-1000" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Den Haag onder €1.000</Link></li>
              <li><Link to="/woningen/amsterdam/2-kamers" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Amsterdam 2 kamers</Link></li>
              <li><Link to="/huurwoningen/groningen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Huurwoningen Groningen</Link></li>
              <li><Link to="/dagelijkse-alert" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Wekelijkse alert</Link></li>
            </ul>
          </div>

          {/* Stadsgidsen & budget landingspaginas */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">Stadsgidsen & budget</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/verhuizen-naar-amsterdam" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Verhuizen naar Amsterdam</Link></li>
              <li><Link to="/verhuizen-naar-rotterdam" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Verhuizen naar Rotterdam</Link></li>
              <li><Link to="/verhuizen-naar-utrecht" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Verhuizen naar Utrecht</Link></li>
              <li><Link to="/huurwoningen-onder-1000-amsterdam" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Huur onder €1.000 Amsterdam</Link></li>
              <li><Link to="/huurwoningen-onder-1500-rotterdam" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Huur onder €1.500 Rotterdam</Link></li>
              <li><Link to="/koopwoningen-onder-300000-utrecht" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Koop onder €300k Utrecht</Link></li>
              <li><Link to="/koopwoningen-onder-500000-amsterdam" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Koop onder €500k Amsterdam</Link></li>
              <li><Link to="/budget-tool" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">Budget tool</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">Ondersteuning</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/veelgestelde-vragen" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  Veelgestelde vragen
                </Link>
              </li>
              <li>
                <Link to="/voorwaarden" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  Algemene voorwaarden
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  Privacybeleid
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/over-huurbaasje" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  Over Huurbaasje
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/samenwerking" className="text-background/70 transition-colors hover:text-background hover:underline underline-offset-4">
                  Samenwerking
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-background">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-background/80">
                <Mail className="h-4 w-4" />
                info@huurbaasje.nl
              </li>
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61588380235270"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-background/70 transition-colors hover:text-background hover:underline underline-offset-4"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/huurbaasje"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-background/70 transition-colors hover:text-background hover:underline underline-offset-4"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/huurbaasje/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-background/70 transition-colors hover:text-background hover:underline underline-offset-4"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Popular cities row for SEO crawlability */}
        <div className="mt-8 border-t-2 border-background/30 pt-6">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-background">Woningen per stad</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-background/70">
            {[
              { label: "Amsterdam", href: "/woningen-amsterdam" },
              { label: "Rotterdam", href: "/woningen-rotterdam" },
              { label: "Utrecht", href: "/woningen-utrecht" },
              { label: "Den Haag", href: "/woningen-den-haag" },
              { label: "Eindhoven", href: "/woningen-eindhoven" },
              { label: "Groningen", href: "/woningen-groningen" },
              { label: "Tilburg", href: "/woningen-tilburg" },
              { label: "Almere", href: "/woningen-almere" },
              { label: "Breda", href: "/woningen-breda" },
              { label: "Nijmegen", href: "/woningen-nijmegen" },
              { label: "Arnhem", href: "/woningen-arnhem" },
              { label: "Haarlem", href: "/woningen-haarlem" },
              { label: "Leiden", href: "/woningen-leiden" },
              { label: "Maastricht", href: "/woningen-maastricht" },
              { label: "Delft", href: "/woningen-delft" },
              { label: "Zwolle", href: "/woningen-zwolle" },
              { label: "Apeldoorn", href: "/woningen-apeldoorn" },
              { label: "Amersfoort", href: "/woningen-amersfoort" },
            ].map((city) => (
              <Link key={city.href} to={city.href} className="transition-colors hover:text-background hover:underline underline-offset-4">
                {city.label}
              </Link>
            ))}
            <Link to="/steden" className="font-semibold text-background transition-colors hover:underline">
              Alle steden →
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t-2 border-background/30 pt-6">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-background/70">
            © {new Date().getFullYear()} Huurbaasje. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
