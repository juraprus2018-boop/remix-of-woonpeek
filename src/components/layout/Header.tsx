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
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center transition-opacity hover:opacity-80" aria-label="home">
          <Logo size="h-11 md:h-12" />
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
                            to="/zoeken"
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
                        to="/steden"
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

          <Link to="/woning-plaatsen">
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
                <DropdownMenuItem asChild><Link to="/mijn-woningen">{t("nav.lettingItems.post")}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/favorieten">{t("common.viewAll")}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/zoekalerts" className="flex items-center gap-2"><Bell className="h-4 w-4" />{t("common.alerts")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/berichten" className="flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t("common.contact")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profiel" className="flex items-center gap-2"><User className="h-4 w-4" />{t("common.myAccount")}</Link>
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
              <Link to="/inloggen">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="h-4 w-4" />{t("common.login")}
                </Button>
              </Link>
              <Link to="/registreren">
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
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t("common.menu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <nav className="flex flex-col gap-1 pt-8">
              <Link to="/zoeken" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                <Search className="h-5 w-5" />{t("common.search")}
              </Link>

              {woningCategories.map((cat) => (
                <Collapsible key={cat.href} open={openMobileCategory === cat.href} onOpenChange={(open) => setOpenMobileCategory(open ? cat.href : null)}>
                  <div className="flex items-center">
                    <Link to={cat.href} onClick={() => setIsOpen(false)} className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                      <cat.icon className="h-5 w-5" />
                      {cat.label}
                    </Link>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <ChevronDown className={`h-4 w-4 transition-transform ${openMobileCategory === cat.href ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="ml-8 space-y-0.5 pb-2">
                      {topCities.slice(0, 8).map((city) => (
                        <Link key={city} to={`${cat.cityPrefix}/${cityToSlug(city)}`} onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                          <MapPin className="h-3 w-3" />
                          {city}
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}

              <div className="my-2 border-t" />

              <Link to="/nieuw-aanbod" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                <CalendarDays className="h-5 w-5" />{t("nav.discoverItems.newListings")}
              </Link>
              <Link to="/verkennen" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                <Map className="h-5 w-5" />{t("nav.discoverItems.map")}
              </Link>
              <Link to="/steden" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                <MapPin className="h-5 w-5" />{t("common.cities")}
              </Link>
              <Link to="/dagelijkse-alert" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                <Bell className="h-5 w-5" />{t("nav.discoverItems.dailyAlert")}
              </Link>
              <Link to="/favorieten" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                <Heart className="h-5 w-5" />{t("common.viewAll")}
              </Link>
              <Link to="/makelaar-koppelen" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                <Handshake className="h-5 w-5" />{t("nav.lettingItems.agentLink")}
              </Link>
              <Link to="/woning-plaatsen" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2.5 font-medium text-accent-foreground transition-colors hover:bg-accent/90">
                <PlusCircle className="h-5 w-5" />{t("nav.lettingItems.post")}
              </Link>

              <div className="my-2 border-t" />

              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">{user.email}</div>
                  <Link to="/mijn-woningen" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                    {t("nav.lettingItems.post")}
                  </Link>
                  <Link to="/profiel" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                    <User className="h-5 w-5" />{t("common.myAccount")}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                      <Shield className="h-5 w-5" />{t("common.admin")}
                    </Link>
                  )}
                  <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-destructive transition-colors hover:bg-muted">
                    <LogOut className="h-5 w-5" />{t("common.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/inloggen" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-muted">
                    <User className="h-5 w-5" />{t("common.login")}
                  </Link>
                  <Link to="/registreren" onClick={() => setIsOpen(false)}>
                    <Button className="mt-1 w-full bg-accent text-accent-foreground hover:bg-accent/90">{t("common.register")}</Button>
                  </Link>
                </>
              )}

              <div className="mt-3 border-t pt-3">
                <LanguageSwitcher />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
