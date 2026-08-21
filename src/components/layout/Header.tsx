import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L as Link } from "@/components/LocalizedLink";
import { Button } from "@/components/ui/button";
import {
  Search, Heart, PlusCircle, User, Menu, LogOut, Shield, Map, Bell,
  MapPin, CalendarDays, Home, Building2, DoorOpen, BedDouble,
  ChevronRight, Handshake, MessageCircle, Calculator, Sparkles,
  TrendingUp, BookOpen, HelpCircle, Mail, X
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cityToSlug } from "@/lib/cities";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const topCities = [
  "Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven",
  "Groningen", "Leiden", "Breda", "Tilburg", "Nijmegen",
  "Arnhem", "Haarlem",
];

const Header = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [locating, setLocating] = useState(false);

  const handleNearby = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Locatie wordt niet ondersteund door je browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        navigate(`/op-kaart?lat=${latitude.toFixed(6)}&lng=${longitude.toFixed(6)}&radius=10`);
      },
      (err) => {
        setLocating(false);
        toast.error(
          err.code === err.PERMISSION_DENIED
            ? "Geef toestemming voor locatie om woningen in de buurt te zien"
            : "Kon je locatie niet bepalen"
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Lock body scroll while overlay is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const woningCategories = [
    { label: t("nav.categories.rentals"), href: "/huurwoningen", icon: Home, cityPrefix: "/huurwoningen" },
    { label: t("nav.categories.apartments"), href: "/appartement-huren", icon: Building2, cityPrefix: "/appartement-huren" },
    { label: t("nav.categories.houses"), href: "/huis-huren", icon: Home, cityPrefix: "/huis-huren" },
    { label: t("nav.categories.rooms"), href: "/kamer-huren", icon: DoorOpen, cityPrefix: "/kamer-huren" },
    { label: t("nav.categories.studios"), href: "/studio-huren", icon: BedDouble, cityPrefix: "/studio-huren" },
  ];

  const discoverItems = [
    { to: "/vandaag", icon: CalendarDays, label: t("nav.discoverItems.newListings") },
    { to: "/op-kaart", icon: Map, label: t("nav.discoverItems.map") },
    { to: "/plekken", icon: MapPin, label: t("common.cities") },
    { to: "/woonradar", icon: Bell, label: t("nav.discoverItems.dailyAlert") },
    { to: "/woonkompas", icon: Sparkles, label: t("nav.discoverItems.quiz") },
  ];

  const toolsItems = [
    { to: "/budgetcheck", icon: Calculator, label: t("nav.toolsItems.budget") },
    { to: "/markt/amsterdam", icon: TrendingUp, label: t("nav.toolsItems.monitor") },
  ];

  const lettingItems = [
    { to: "/plaatsen-start", icon: PlusCircle, label: t("nav.lettingItems.post") },
    { to: "/samenwerken", icon: Mail, label: t("nav.lettingItems.partner") },
    { to: "/over", icon: HelpCircle, label: t("footer.linkAbout") },
  ];

  const sections = [
    { key: "rent", title: t("nav.rent"), items: woningCategories.map(c => ({ to: c.href, icon: c.icon, label: c.label })) },
    { key: "discover", title: t("nav.discover"), items: discoverItems },
    { key: "tools", title: t("nav.tools"), items: toolsItems },
    { key: "letting", title: t("nav.letting"), items: lettingItems },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-foreground bg-background">
        <div className="container flex h-20 items-center justify-between md:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center transition-opacity hover:opacity-80" aria-label="home">
            <Logo size="h-20 md:h-24" />
          </Link>

          {/* Right cluster */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Free post CTA — desktop only */}
            <Button
              onClick={handleNearby}
              disabled={locating}
              size="sm"
              className="hidden md:inline-flex h-11 gap-1.5 rounded-full bg-sun px-5 font-bold text-foreground shadow-sm hover:bg-sun/90 whitespace-nowrap"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {t("common.nearbyRentals")}
            </Button>

            {/* Kaart met alle woningen — desktop only */}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden md:inline-flex h-11 gap-1.5 rounded-full border-2 border-foreground px-5 font-bold whitespace-nowrap"
            >
              <Link to="/op-kaart">
                <Map className="h-4 w-4" />
                Op de kaart
              </Link>
            </Button>



            {/* Auth — desktop only */}
            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-11 w-11 rounded-full p-0">
                      <Avatar className="h-9 w-9 ring-2 ring-foreground">
                        <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                          {getInitials(user.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem className="text-xs text-muted-foreground">{user.email}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/mijn-aanbod">{t("nav.lettingItems.post")}</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/opgeslagen">{t("common.viewAll")}</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/radarmeldingen" className="flex items-center gap-2"><Bell className="h-4 w-4" />{t("common.alerts")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/chat" className="flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t("common.contact")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex items-center gap-2"><User className="h-4 w-4" />{t("common.myAccount")}</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2"><Shield className="h-4 w-4" />{t("common.admin")}</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />{t("common.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="h-11 gap-1.5 rounded-full font-semibold">
                    <User className="h-4 w-4" />
                    {t("common.login")}
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile-only avatar / login */}
            <div className="md:hidden">
              {user ? (
                <Link to="/account" aria-label={t("common.myAccount")}>
                  <Avatar className="h-10 w-10 ring-2 ring-foreground">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {getInitials(user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link to="/login" aria-label={t("common.login")}>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full border-2 border-foreground/15">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            {/* MENU BUTTON — always visible */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label={t("common.menu")}
              className="group flex h-12 shrink-0 items-center gap-2.5 rounded-full border-2 border-foreground bg-foreground px-4 text-background transition-all hover:bg-accent hover:border-accent md:h-13 md:px-5"
            >
              <span className="relative flex h-4 w-5 shrink-0 flex-col justify-between">
                <span className="block h-[2px] w-full rounded-full bg-background transition-transform" />
                <span className="block h-[2px] w-full rounded-full bg-background" />
                <span className="block h-[2px] w-3/4 rounded-full bg-background transition-all group-hover:w-full" />
              </span>
              <span className="whitespace-nowrap text-sm font-bold uppercase tracking-wider">{t("common.menu")}</span>

            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN OVERLAY MENU */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          onClick={close}
          className={`absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <div
          className={`relative flex h-full w-full flex-col overflow-hidden bg-sun-tint transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-sun/50 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-40 -left-32 h-[460px] w-[460px] rounded-full bg-sage/60 blur-3xl" aria-hidden />

          {/* Overlay header */}
          <div className="relative z-10 flex items-center justify-between border-b-2 border-foreground px-5 py-5 md:px-10 md:py-6">
            <Link to="/" onClick={close} aria-label="home" className="flex items-center">
              <Logo size="h-16 md:h-20" />
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/woning-zoeken" onClick={close} className="hidden h-11 items-center gap-2 rounded-full border-2 border-foreground bg-background px-4 text-sm font-bold text-foreground transition-colors hover:bg-sun md:inline-flex">
                <Search className="h-4 w-4" />
                {t("common.search")}
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label="Sluiten"
                className="flex h-12 items-center gap-2 rounded-full border-2 border-foreground bg-foreground px-4 text-background transition-colors hover:bg-accent hover:border-accent md:px-5"
              >
                <X className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Sluiten</span>
              </button>
            </div>
          </div>

          {/* Scrollable body: big typographic links + city column */}
          <div className="relative z-10 flex-1 overflow-y-auto">
            <div className="container grid gap-12 py-10 md:py-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16 lg:py-16">
              {/* Sections */}
              <div className="grid gap-8 sm:grid-cols-2">
                {sections.map((section) => (
                  <div key={section.key}>
                    <p className="mb-4 font-serif-display text-sm italic text-foreground/60">
                      {section.title}
                    </p>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            onClick={close}
                            className="group flex items-baseline gap-3 text-foreground transition-colors hover:text-accent"
                          >
                            <span className="font-display text-2xl lowercase leading-none tracking-tight md:text-3xl">
                              {item.label}
                            </span>
                            <ChevronRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Cities column */}
              <aside className="rounded-3xl border-2 border-foreground bg-background p-6 md:p-8">
                <p className="mb-4 font-serif-display text-sm italic text-foreground/60">
                  Populaire steden
                </p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {topCities.map((city) => (
                    <li key={city}>
                      <Link
                        to={`/huurwoningen/${cityToSlug(city)}`}
                        onClick={close}
                        className="group flex items-center gap-2 py-1 text-base font-semibold text-foreground transition-colors hover:text-accent"
                      >
                        <MapPin className="h-3.5 w-3.5 text-foreground/40 group-hover:text-accent" />
                        {city}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/plekken"
                  onClick={close}
                  className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent hover:underline"
                >
                  {t("footer.allCitiesArrow")} <ChevronRight className="h-3 w-3" />
                </Link>

                {/* Mobile-only CTA */}
                <div className="mt-6 md:hidden">
                  <Link to="/plaatsen-start" onClick={close}>
                    <Button className="h-12 w-full gap-2 rounded-full bg-sun font-bold text-foreground hover:bg-sun/90">
                      <PlusCircle className="h-4 w-4" />
                      {t("common.freePost")}
                    </Button>
                  </Link>
                </div>

                {/* Account row */}
                {user ? (
                  <div className="mt-6 flex items-center justify-between border-t-2 border-foreground/10 pt-5">
                    <Link to="/account" onClick={close} className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                          {getInitials(user.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                      {t("common.myAccount")}
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); close(); }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-destructive hover:underline"
                    >
                      <LogOut className="h-3.5 w-3.5" /> {t("common.logout")}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-2 gap-2 border-t-2 border-foreground/10 pt-5">
                    <Link to="/login" onClick={close}>
                      <Button variant="outline" className="h-11 w-full rounded-full border-2 border-foreground text-sm font-bold">
                        {t("common.login")}
                      </Button>
                    </Link>
                    <Link to="/aanmelden" onClick={close}>
                      <Button className="h-11 w-full rounded-full bg-foreground text-sm font-bold text-background hover:bg-accent">
                        {t("common.register")}
                      </Button>
                    </Link>
                  </div>
                )}
              </aside>
            </div>
          </div>

          {/* Overlay footer */}
          <div className="relative z-10 border-t-2 border-foreground bg-background/60 backdrop-blur-sm">
            <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
              <Link to="/over" onClick={close} className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground">
                {t("footer.linkAbout")}
              </Link>
              <span className="hidden text-xs italic text-foreground/50 md:inline font-serif-display">
                woonaanbod-nl.nl
              </span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
