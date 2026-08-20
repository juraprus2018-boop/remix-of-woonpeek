import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { lazy, Suspense, type ReactElement } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import LocaleSync from "@/components/LocaleSync";
import AutoTranslator from "@/components/AutoTranslator";
import RoutePrefetcher from "@/components/RoutePrefetcher";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CookieConsent from "@/components/CookieConsent";
import { paths, LEGACY_REDIRECTS } from "@/lib/routes";
import { usePageTracking } from "@/hooks/usePageTracking";

// Lazy-load every non-critical route to slash the initial JS bundle.
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Search = lazy(() => import("./pages/Search"));
const Explore = lazy(() => import("./pages/Explore"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Favorites = lazy(() => import("./pages/Favorites"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const AdminScrapers = lazy(() => import("./pages/admin/AdminScrapers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAds = lazy(() => import("./pages/admin/AdminAds"));
const AdminSiteSettings = lazy(() => import("./pages/admin/AdminSiteSettings"));
const MyProperties = lazy(() => import("./pages/MyProperties"));
const CreateProperty = lazy(() => import("./pages/CreateProperty"));
const EditProperty = lazy(() => import("./pages/EditProperty"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const CityPage = lazy(() => import("./pages/CityPage"));
const SearchAlerts = lazy(() => import("./pages/SearchAlerts"));
const Profile = lazy(() => import("./pages/Profile"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Cities = lazy(() => import("./pages/Cities"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminUserDetail = lazy(() => import("./pages/admin/AdminUserDetail"));
const AdminDailyActivity = lazy(() => import("./pages/admin/AdminDailyActivity"));
const AdminFacebookQueue = lazy(() => import("./pages/admin/AdminFacebookQueue"));
const AdminMakelaarLeads = lazy(() => import("./pages/admin/AdminMakelaarLeads"));
const AdminEmailSender = lazy(() => import("./pages/admin/AdminEmailSender"));
const AdminAlertSubscribers = lazy(() => import("./pages/admin/AdminAlertSubscribers"));
const ListingTypePage = lazy(() => import("./pages/ListingTypePage"));
const PropertyTypeCityPage = lazy(() => import("./pages/PropertyTypeCityPage"));
const FilteredLandingPage = lazy(() => import("./pages/FilteredLandingPage"));
const NewListings = lazy(() => import("./pages/NewListings"));
const NewListingsCity = lazy(() => import("./pages/NewListingsCity"));
const NeighborhoodPage = lazy(() => import("./pages/NeighborhoodPage"));
const PostPropertyStart = lazy(() => import("./pages/PostPropertyStart"));
const AlertUnsubscribe = lazy(() => import("./pages/AlertUnsubscribe"));
const DailyAlert = lazy(() => import("./pages/DailyAlert"));
const About = lazy(() => import("./pages/About"));
const Samenwerking = lazy(() => import("./pages/Samenwerking"));
const AdminChat = lazy(() => import("./pages/admin/AdminChat"));
const AdminComments = lazy(() => import("./pages/admin/AdminComments"));
const AdminSearchQueries = lazy(() => import("./pages/admin/AdminSearchQueries"));
const AdminGoogleRanking = lazy(() => import("./pages/admin/AdminGoogleRanking"));
const AdminPageTypes = lazy(() => import("./pages/admin/AdminPageTypes"));
const AdminPlaatsenCheck = lazy(() => import("./pages/admin/AdminPlaatsenCheck"));
const UserChat = lazy(() => import("./pages/UserChat"));
const BudgetTool = lazy(() => import("./pages/BudgetTool"));
const CityComparePage = lazy(() => import("./pages/CityComparePage"));
const HuurprijsMonitor = lazy(() => import("./pages/HuurprijsMonitor"));
const PostcodePage = lazy(() => import("./pages/PostcodePage"));
const BudgetLandingPage = lazy(() => import("./pages/BudgetLandingPage"));
const CityGuidePage = lazy(() => import("./pages/CityGuidePage"));
const WoonQuiz = lazy(() => import("./pages/WoonQuiz"));
const IncomeLandingPage = lazy(() => import("./pages/IncomeLandingPage"));
const BestOfCityPage = lazy(() => import("./pages/BestOfCityPage"));
const EnergieVergelijken = lazy(() => import("./pages/EnergieVergelijken"));
const AdminTikTok = lazy(() => import("./pages/admin/AdminTikTok"));
const Transparantie = lazy(() => import("./pages/Transparantie"));
const MakelaarPage = lazy(() => import("./pages/MakelaarPage"));
const Woordenboek = lazy(() => import("./pages/Woordenboek"));
const Verhuischecklist = lazy(() => import("./pages/Verhuischecklist"));
const VerhuizenVanNaar = lazy(() => import("./pages/VerhuizenVanNaar"));
const ContractCheck = lazy(() => import("./pages/ContractCheck"));
const CityStats = lazy(() => import("./pages/CityStats"));
const HypotheekBerekenen = lazy(() => import("./pages/HypotheekBerekenen"));
const EnergieCityPage = lazy(() => import("./pages/EnergieCityPage"));
const Nieuwbouw = lazy(() => import("./pages/Nieuwbouw"));
const NieuwbouwCity = lazy(() => import("./pages/NieuwbouwCity"));
const WozWaarde = lazy(() => import("./pages/WozWaarde"));
const StudentenCity = lazy(() => import("./pages/StudentenCity"));
const InternetVergelijken = lazy(() => import("./pages/InternetVergelijken"));
const WozWaardeCity = lazy(() => import("./pages/WozWaardeCity"));
const VerhuisService = lazy(() => import("./pages/VerhuisService"));
const VerhuisServiceCity = lazy(() => import("./pages/VerhuisServiceCity"));
const LongtailLanding = lazy(() => import("./pages/LongtailLanding"));
const RentHeatmapPage = lazy(() => import("./pages/RentHeatmapPage"));
const RentIndexPage = lazy(() => import("./pages/RentIndexPage"));
const Verhuiskosten = lazy(() => import("./pages/Verhuiskosten"));
const SocialeHuurWachttijd = lazy(() => import("./pages/SocialeHuurWachttijd"));
const HuurcontractUitleg = lazy(() => import("./pages/HuurcontractUitleg"));
const ExpatHousing = lazy(() => import("./pages/ExpatHousing"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Laden" />
  </div>
);

/**
 * Wildcard-redirect: vervangt `:param` in `to` met de gematchte waarde uit
 * `useParams`, preserveert query string. Gebruikt voor old → new bridges.
 */
const ParamRedirect = ({ to }: { to: string }) => {
  const params = useParams();
  const location = useLocation();
  const resolved = to.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => params[key] ?? "");
  return <Navigate to={`${resolved}${location.search}`} replace />;
};

const LegacyCityRedirect = () => {
  const { city } = useParams<{ city: string }>();
  const location = useLocation();
  if (!city) return <Navigate to="/plekken" replace />;
  const slug = city.startsWith("woningen-") ? city.slice("woningen-".length) : city;
  return <Navigate to={`/stad/${slug}${location.search}`} replace />;
};

const RouterSideEffects = () => {
  usePageTracking();
  return (
    <>
      <ScrollToTop />
      <LocaleSync />
      <AutoTranslator />
      <RoutePrefetcher />
    </>
  );
};

type RouteDef = { path: string; element: ReactElement };

/** Nieuwe canonieke routes. Hiërarchisch (slash-based). */
const PAGES: RouteDef[] = [
  { path: "/", element: <Index /> },

  // Account / auth
  { path: "/login", element: <Login /> },
  { path: "/aanmelden", element: <Register /> },
  { path: "/account", element: <Profile /> },
  { path: "/chat", element: <UserChat /> },
  { path: "/opgeslagen", element: <Favorites /> },
  { path: "/mijn-aanbod", element: <MyProperties /> },
  { path: "/plaatsen-start", element: <PostPropertyStart /> },
  { path: "/aanbod-toevoegen", element: <CreateProperty /> },
  { path: "/aanbod/:id/bewerken", element: <EditProperty /> },

  // Zoek + ontdek
  { path: "/woning-zoeken", element: <Search /> },
  { path: "/vinden", element: <Navigate to="/woning-zoeken" replace /> },

  { path: "/op-kaart", element: <Explore /> },
  { path: "/aanbod/:slug", element: <PropertyDetail /> },
  { path: "/vandaag", element: <NewListings /> },
  { path: "/vandaag/:city", element: <NewListingsCity /> },
  { path: "/woonradar", element: <DailyAlert /> },
  { path: "/radarmeldingen", element: <SearchAlerts /> },
  { path: "/radarmeldingen/uit/:token", element: <AlertUnsubscribe /> },

  // Stad
  { path: "/stad/:city", element: <CityPage /> },
  { path: "/plekken", element: <Cities /> },
  { path: "/buurt/:city/:neighborhood", element: <NeighborhoodPage /> },
  { path: "/markt/:city", element: <HuurprijsMonitor /> },
  { path: "/cijfers/:city", element: <CityStats /> },
  { path: "/stadsgids/:city", element: <CityGuidePage /> },
  { path: "/duel/:city1-vs-:city2", element: <CityComparePage /> },
  { path: "/toplijst/:city/goedkoop-huur", element: <BestOfCityPage variant="goedkoopste-huur" /> },
  { path: "/toplijst/:city/grootste-huur", element: <BestOfCityPage variant="grootste-huur" /> },
  { path: "/toplijst/:city/buurten", element: <BestOfCityPage variant="beste-buurten" /> },
  { path: "/postcode/:postcode", element: <PostcodePage /> },

  // Listing type (huren / kopen)
  { path: "/huren", element: <ListingTypePage listingType="huur" /> },
  { path: "/huren/:city", element: <ListingTypePage listingType="huur" /> },
  { path: "/huren/:city/:filter", element: <FilteredLandingPage listingType="huur" /> },
  { path: "/kopen", element: <ListingTypePage listingType="koop" /> },
  { path: "/kopen/:city", element: <ListingTypePage listingType="koop" /> },
  { path: "/kopen/:city/:filter", element: <FilteredLandingPage listingType="koop" /> },

  // Property type
  { path: "/appartement", element: <PropertyTypeCityPage propertyType="appartement" /> },
  { path: "/appartement/:city", element: <PropertyTypeCityPage propertyType="appartement" /> },
  { path: "/appartement/:city/:filter", element: <FilteredLandingPage propertyType="appartement" /> },
  { path: "/huis", element: <PropertyTypeCityPage propertyType="huis" /> },
  { path: "/huis/:city", element: <PropertyTypeCityPage propertyType="huis" /> },
  { path: "/huis/:city/:filter", element: <FilteredLandingPage propertyType="huis" /> },
  { path: "/studio", element: <PropertyTypeCityPage propertyType="studio" /> },
  { path: "/studio/:city", element: <PropertyTypeCityPage propertyType="studio" /> },
  { path: "/studio/:city/:filter", element: <FilteredLandingPage propertyType="studio" /> },
  { path: "/kamer", element: <PropertyTypeCityPage propertyType="kamer" /> },
  { path: "/kamer/:city", element: <PropertyTypeCityPage propertyType="kamer" /> },
  { path: "/kamer/:city/:filter", element: <FilteredLandingPage propertyType="kamer" /> },
  { path: "/aanbod-in/:city/:filter", element: <FilteredLandingPage /> },

  // Budget / inkomen landings
  { path: "/budget-huur/:budget/:city", element: <BudgetLandingPage listingType="huur" /> },
  { path: "/budget-koop/:budget/:city", element: <BudgetLandingPage listingType="koop" /> },
  { path: "/inkomen/:income/:city", element: <IncomeLandingPage /> },

  // 50 long-tail SEO gidsen per stad
  { path: "/gids/:slug", element: <LongtailLanding /> },

  // Data / SEO
  { path: "/heatmap/:city", element: <RentHeatmapPage /> },
  { path: "/huurprijs-index/:city", element: <RentIndexPage /> },


  // Content
  { path: "/vragen", element: <FAQ /> },
  { path: "/over", element: <About /> },
  { path: "/woordenboek", element: <Woordenboek /> },

  // Tools
  { path: "/budgetcheck", element: <BudgetTool /> },
  { path: "/woonkompas", element: <WoonQuiz /> },
  { path: "/energie", element: <EnergieVergelijken /> },
  { path: "/energie/:city", element: <EnergieCityPage /> },
  { path: "/nieuwbouw", element: <Nieuwbouw /> },
  { path: "/nieuwbouw/:city", element: <NieuwbouwCity /> },
  { path: "/hypotheek-berekenen", element: <HypotheekBerekenen /> },
  { path: "/woz-waarde", element: <WozWaarde /> },
  { path: "/woz-waarde/:city", element: <WozWaardeCity /> },
  { path: "/internet", element: <InternetVergelijken /> },
  { path: "/verhuisservice", element: <VerhuisService /> },
  { path: "/verhuisservice/:city", element: <VerhuisServiceCity /> },
  { path: "/studenten/:city", element: <StudentenCity /> },
  { path: "/verhuischecklist", element: <Verhuischecklist /> },
  { path: "/verhuizen/:from/:to", element: <VerhuizenVanNaar /> },
  { path: "/contract-check", element: <ContractCheck /> },
  { path: "/verhuiskosten", element: <Verhuiskosten /> },
  { path: "/sociale-huur-wachttijd", element: <SocialeHuurWachttijd /> },
  { path: "/huurcontract-uitleg", element: <HuurcontractUitleg /> },
  { path: "/expat-housing", element: <ExpatHousing /> },

  // B2B
  { path: "/samenwerken", element: <Samenwerking /> },
  { path: "/makelaar/:slug", element: <MakelaarPage /> },
  { path: "/transparantie", element: <Transparantie /> },

  // Legal
  { path: "/voorwaarden", element: <TermsAndConditions /> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/disclaimer", element: <Disclaimer /> },
  { path: "/niet-gevonden", element: <NotFound /> },

  // Legacy single-segment city fallback (laatste, vangt /:city)
  { path: "/:city", element: <LegacyCityRedirect /> },
];

// Admin pages — NL only (admin doesn't need localisation)
const ADMIN_PAGES: RouteDef[] = [
  { path: "/admin", element: <AdminDashboard /> },
  { path: "/admin/woningen", element: <AdminProperties /> },
  { path: "/admin/scrapers", element: <AdminScrapers /> },
  { path: "/admin/instellingen", element: <AdminSettings /> },
  { path: "/admin/advertenties", element: <AdminAds /> },
  { path: "/admin/site-instellingen", element: <AdminSiteSettings /> },
  { path: "/admin/blog", element: <AdminBlog /> },
  { path: "/admin/gebruikers", element: <AdminUsers /> },
  { path: "/admin/gebruikers/:userId", element: <AdminUserDetail /> },
  { path: "/admin/dagoverzicht", element: <AdminDailyActivity /> },
  { path: "/admin/facebook", element: <AdminFacebookQueue /> },
  { path: "/admin/tiktok", element: <AdminTikTok /> },
  { path: "/admin/leads", element: <AdminMakelaarLeads /> },
  { path: "/admin/email", element: <AdminEmailSender /> },
  { path: "/admin/alerts", element: <AdminAlertSubscribers /> },
  { path: "/admin/berichten", element: <AdminChat /> },
  { path: "/admin/reacties", element: <AdminComments /> },
  { path: "/admin/zoekopdrachten", element: <AdminSearchQueries /> },
  { path: "/admin/google-ranking", element: <AdminGoogleRanking /> },
  { path: "/admin/paginatypen", element: <AdminPageTypes /> },
  { path: "/admin/plaatsen-check", element: <AdminPlaatsenCheck /> },
];

const LOCALE_PREFIXES = ["", "/en", "/de", "/fr"] as const;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouterSideEffects />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {ADMIN_PAGES.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
              {LOCALE_PREFIXES.flatMap((prefix) => [
                // Canonieke nieuwe paden
                ...PAGES.map((r) => {
                  const path =
                    r.path === "/"
                      ? prefix === ""
                        ? "/"
                        : prefix
                      : prefix + r.path;
                  return <Route key={prefix + "::" + r.path} path={path} element={r.element} />;
                }),
                // Legacy redirects (oude flat-style URLs → nieuwe paden)
                ...LEGACY_REDIRECTS.map(({ from, to }) => (
                  <Route
                    key={prefix + "::legacy::" + from}
                    path={prefix + from}
                    element={<ParamRedirect to={prefix + to} />}
                  />
                )),
              ])}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
