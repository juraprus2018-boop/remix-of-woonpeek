import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L as Link } from "@/components/LocalizedLink";
import { Button } from "@/components/ui/button";
import {
  Search, Heart, PlusCircle, User, Menu, LogOut, Shield, Map, Bell,
  MapPin, CalendarDays, Home, Building2, DoorOpen, BedDouble, ChevronDown,
  ChevronRight, Handshake, MessageCircle, Calculator, Sparkles,
  TrendingUp, BookOpen, HelpCircle, Mail
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cityToSlug } from "@/lib/cities";

const topCities = [
  "Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven",
  "Groningen", "Leiden", "Breda", "Tilburg", "Nijmegen",
  "Arnhem", "Haarlem",
];

const Header = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const woningCategories = [
    { label: t("nav.categories.rentals"), href: "/huren", icon: Home,
      description: t("nav.categories.rentalsDesc"), cityPrefix: "/huren" },
    { label: t("nav.categories.apartments"), href: "/appartement", icon: Building2,
      description: t("nav.categories.apartmentsDesc"), cityPrefix: "/appartement" },
    { label: t("nav.categories.houses"), href: "/huis", icon: Home,
      description: t("nav.categories.housesDesc"), cityPrefix: "/huis" },
    { label: t("nav.categories.rooms"), href: "/kamer", icon: DoorOpen,
      description: t("nav.categories.roomsDesc"), cityPrefix: "/kamer" },
    { label: t("nav.categories.studios"), href: "/studio", icon: BedDouble,
      description: t("nav.categories.studiosDesc"), cityPrefix: "/studio" },
  ];

  const [hoveredCategory, setHoveredCategory] = useState(woningCategories[0]);

  const discoverItems = [
    { to: "/vandaag", icon: CalendarDays, label: t("nav.discoverItems.newListings"), desc: t("nav.discoverItems.newListingsDesc") },
    { to: "/op-kaart", icon: Map, label: t("nav.discoverItems.map"), desc: t("nav.discoverItems.mapDesc") },
    { to: "/plekken", icon: MapPin, label: t("common.cities"), desc: t("nav.categories.rentalsDesc") },
    { to: "/woonradar", icon: Bell, label: t("nav.discoverItems.dailyAlert"), desc: t("nav.discoverItems.dailyAlertDesc") },
    { to: "/woonkompas", icon: Sparkles, label: t("nav.discoverItems.quiz"), desc: t("nav.discoverItems.quizDesc") },
  ];

  const toolsItems = [
    { to: "/budgetcheck", icon: Calculator, label: t("nav.toolsItems.budget"), desc: t("nav.toolsItems.budgetDesc") },
    { to: "/markt/amsterdam", icon: TrendingUp, label: t("nav.toolsItems.monitor"), desc: t("nav.toolsItems.monitorDesc") },
    { to: "/journaal", icon: BookOpen, label: t("nav.toolsItems.blog"), desc: t("nav.toolsItems.blogDesc") },
  ];

  const lettingItems = [
    { to: "/plaatsen-start", icon: PlusCircle, label: t("nav.lettingItems.post"), desc: t("nav.lettingItems.postDesc") },
    { to: "/partnerprogramma", icon: Handshake, label: t("nav.lettingItems.agentLink"), desc: t("nav.lettingItems.agentLinkDesc") },
    { to: "/samenwerken", icon: Mail, label: t("nav.lettingItems.partner"), desc: t("nav.lettingItems.partnerDesc") },
    { to: "/over", icon: HelpCircle, label: t("footer.linkAbout"), desc: t("nav.lettingItems.partnerDesc") },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
      <div className="container flex h-20 md:h-24 items-center justify-between">
        <Link to="/" className="flex items-center transition-opacity hover:opacity-80" aria-label="home">
          <Logo size="h-24 md:h-28" />
        </Link>


        {/* Desktop Navigation */}
        <div className="hidden items-center gap-0.5 lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-0">
              {/* HUREN */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="gap-1.5 bg-transparent text-sm font-medium">
                  <Search className="h-4 w-4" />
                  {t("nav.rent")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[640px] grid-cols-[1fr_1fr] gap-0 p-0">
                    <div className="border-r p-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("nav.categories.rentals")}
                      </p>
                      <ul className="space-y-1">
                        {woningCategories.map((cat) => (
                          <li key={cat.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={cat.href}
                                onMouseEnter={() => setHoveredCategory(cat)}
                                className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted ${hoveredCategory.href === cat.href ? 'bg-muted' : ''}`}
                              >
                                <cat.icon className={`h-4 w-4 transition-colors ${hoveredCategory.href === cat.href ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                                <div>
                                  <span className="font-medium">{cat.label}</span>
                                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 border-t pt-3">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/vinden"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
                          >
                            <Search className="h-4 w-4" />
                            {t("common.search")}
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {hoveredCategory.label} {t("nav.popularInType")}
                      </p>
                      <ul className="grid grid-cols-2 gap-0.5">
                        {topCities.map((city) => (
                          <li key={city}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={`${hoveredCategory.cityPrefix}/${cityToSlug(city)}`}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                              >
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{city}</span>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/plekken"
                        className="mt-3 flex items-center gap-1 px-2 text-xs font-medium text-primary hover:underline"
                      >
                        {t("footer.allCitiesArrow")}
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ONTDEKKEN */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="gap-1.5 bg-transparent text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  {t("nav.discover")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] gap-1 p-3">
                    {discoverItems.map((item) => (
                      <li key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link to={item.to} className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted">
                            <item.icon className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                              <div className="text-sm font-medium">{item.label}</div>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* TOOLS */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="gap-1.5 bg-transparent text-sm font-medium">
                  <Calculator className="h-4 w-4" />
                  {t("nav.tools")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] gap-1 p-3">
                    {toolsItems.map((item) => (
                      <li key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link to={item.to} className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted">
                            <item.icon className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                              <div className="text-sm font-medium">{item.label}</div>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* VERHUREN */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="gap-1.5 bg-transparent text-sm font-medium">
                  <Handshake className="h-4 w-4" />
                  {t("nav.letting")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] gap-1 p-3">
                    {lettingItems.map((item) => (
                      <li key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link to={item.to} className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted">
                            <item.icon className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                              <div className="text-sm font-medium">{item.label}</div>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link to="/plaatsen-start">
            <Button size="sm" className="ml-2 gap-1.5 rounded-full bg-sun px-4 font-bold text-foreground hover:bg-sun/90">
              <PlusCircle className="h-4 w-4" />
              {t("common.freePost")}
            </Button>
          </Link>
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-2 lg:flex" style={{ minHeight: '40px' }}>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-muted-foreground text-sm">{user.email}</DropdownMenuItem>
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
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="h-4 w-4" />{t("common.login")}
                </Button>
              </Link>
              <Link to="/aanmelden">
                <Button size="sm" className="rounded-full bg-sun px-4 font-bold text-foreground hover:bg-sun/90">
                  {t("common.register")}
                </Button>
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 rounded-2xl border border-border bg-card hover:bg-sun/20"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t("common.menu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex w-full flex-col gap-0 border-l-0 bg-background p-0 sm:max-w-md"
          >
            {/* Header inside menu */}
            <div className="flex items-center justify-between border-b border-border px-5 pb-4 pt-5">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t("common.menu")}
              </span>
              {user ? (
                <Link
                  to="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-sun">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {getInitials(user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 gap-1.5 rounded-full px-3 text-xs font-bold"
                  >
                    <User className="h-4 w-4" />
                    {t("common.login")}
                  </Button>
                </Link>
              )}
            </div>

            {/* Search CTA */}
            <div className="border-b border-border px-5 py-4">
              <Link
                to="/vinden"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-muted/70 px-4 py-3.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                <Search className="h-4 w-4" />
                <span className="flex-1">{t("common.search")}…</span>
                <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] font-bold">
                  Go
                </kbd>
              </Link>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
              {/* Primary tile grid */}
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t("nav.rent")}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {woningCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    to={cat.href}
                    onClick={() => setIsOpen(false)}
                    className="group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all active:scale-[0.98] hover:border-sun hover:shadow-sm"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sun/20 text-foreground transition-colors group-hover:bg-sun">
                      <cat.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-bold leading-tight text-foreground">
                      {cat.label}
                    </span>
                  </Link>
                ))}
                <Link
                  to="/plaatsen-start"
                  onClick={() => setIsOpen(false)}
                  className="group relative col-span-2 flex items-center justify-between overflow-hidden rounded-2xl bg-foreground p-4 text-background transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sun text-foreground">
                      <PlusCircle className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-bold">
                      {t("nav.lettingItems.post")}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Discover list */}
              <p className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t("nav.discover")}
              </p>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {discoverItems.map((item, i) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted ${
                      i !== 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">
                        {item.label}
                      </div>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>

              {/* Tools list */}
              <p className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t("nav.tools")}
              </p>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {toolsItems.map((item, i) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted ${
                      i !== 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">
                        {item.label}
                      </div>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>

              {/* Account section */}
              <p className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t("common.myAccount")}
              </p>
              {user ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t("common.login")}
                    </div>
                    <div className="truncate text-sm font-semibold text-foreground">
                      {user.email}
                    </div>
                  </div>
                  <Link to="/mijn-aanbod" onClick={() => setIsOpen(false)} className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium hover:bg-muted">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    {t("nav.lettingItems.post")}
                  </Link>
                  <Link to="/opgeslagen" onClick={() => setIsOpen(false)} className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium hover:bg-muted">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    {t("common.viewAll")}
                  </Link>
                  <Link to="/radarmeldingen" onClick={() => setIsOpen(false)} className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium hover:bg-muted">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    {t("common.alerts")}
                  </Link>
                  <Link to="/chat" onClick={() => setIsOpen(false)} className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium hover:bg-muted">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    {t("common.contact")}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium hover:bg-muted">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {t("common.admin")}
                    </Link>
                  )}
                  <button
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-destructive hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("common.logout")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="h-12 w-full rounded-2xl border-border text-sm font-bold">
                      {t("common.login")}
                    </Button>
                  </Link>
                  <Link to="/aanmelden" onClick={() => setIsOpen(false)}>
                    <Button className="h-12 w-full rounded-2xl bg-sun text-sm font-bold text-foreground hover:bg-sun/90">
                      {t("common.register")}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Footer row */}
              <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                <Link
                  to="/over"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  {t("footer.linkAbout")}
                </Link>
                <LanguageSwitcher />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
