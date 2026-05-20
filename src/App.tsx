import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { lazy, Suspense, type ReactElement } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import LocaleSync from "@/components/LocaleSync";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CookieConsent from "@/components/CookieConsent";
import { cityPath } from "@/lib/cities";
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
const BlogPage = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
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
const MakelaarKoppelen = lazy(() => import("./pages/MakelaarKoppelen"));
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

const LegacyCityRedirect = () => {
  const { city } = useParams<{ city: string }>();
  const location = useLocation();

  if (!city) return <Navigate to="/steden" replace />;
  if (city.startsWith("woningen-")) return <CityPage />;

  return <Navigate to={`${cityPath(city)}${location.search}`} replace />;
};

const RouterSideEffects = () => {
  usePageTracking();
  return (
    <>
      <ScrollToTop />
      <LocaleSync />
    </>
  );
};

// All site routes defined once. Rendered 4x with locale prefixes.
type RouteDef = { path: string; element: ReactElement };

const PAGES: RouteDef[] = [
  { path: "/", element: <Index /> },
  { path: "/inloggen", element: <Login /> },
  { path: "/registreren", element: <Register /> },
  { path: "/zoeken", element: <Search /> },
  { path: "/verkennen", element: <Explore /> },
  { path: "/kaart", element: <Explore /> },
  { path: "/woning/:slug", element: <PropertyDetail /> },
  { path: "/favorieten", element: <Favorites /> },
  { path: "/mijn-woningen", element: <MyProperties /> },
  { path: "/woning-plaatsen", element: <PostPropertyStart /> },
  { path: "/plaatsen", element: <CreateProperty /> },
  { path: "/woning/:id/bewerken", element: <EditProperty /> },
  { path: "/voorwaarden", element: <TermsAndConditions /> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/disclaimer", element: <Disclaimer /> },
  { path: "/veelgestelde-vragen", element: <FAQ /> },
  { path: "/blog", element: <BlogPage /> },
  { path: "/blog/:slug", element: <BlogPostPage /> },
  { path: "/zoekalerts", element: <SearchAlerts /> },
  { path: "/profiel", element: <Profile /> },
  { path: "/berichten", element: <UserChat /> },
  { path: "/steden", element: <Cities /> },
  { path: "/nieuw-aanbod", element: <NewListings /> },
  { path: "/nieuw-aanbod/:city", element: <NewListingsCity /> },
  { path: "/dagelijkse-alert", element: <DailyAlert /> },
  { path: "/over-huurbaasje", element: <About /> },
  { path: "/makelaar-koppelen", element: <MakelaarKoppelen /> },
  { path: "/samenwerking", element: <Samenwerking /> },
  { path: "/budget-tool", element: <BudgetTool /> },
  { path: "/woonquiz", element: <WoonQuiz /> },
  { path: "/energie-vergelijken", element: <EnergieVergelijken /> },
  { path: "/vergelijk/:city1-vs-:city2", element: <CityComparePage /> },
  { path: "/huurprijzen/:city", element: <HuurprijsMonitor /> },
  { path: "/woningen-postcode-:postcode", element: <PostcodePage /> },
  { path: "/huurwoningen-onder-:budget-:city", element: <BudgetLandingPage listingType="huur" /> },
  { path: "/koopwoningen-onder-:budget-:city", element: <BudgetLandingPage listingType="koop" /> },
  { path: "/huur-bij-inkomen-:income-:city", element: <IncomeLandingPage /> },
  { path: "/verhuizen-naar-:city", element: <CityGuidePage /> },
  { path: "/goedkoopste-huurwoningen/:city", element: <BestOfCityPage variant="goedkoopste-huur" /> },
  { path: "/grootste-huurwoningen/:city", element: <BestOfCityPage variant="grootste-huur" /> },
  { path: "/beste-buurten/:city", element: <BestOfCityPage variant="beste-buurten" /> },
  { path: "/alerts/afmelden/:token", element: <AlertUnsubscribe /> },
  { path: "/huurwoningen/:city/:filter", element: <FilteredLandingPage listingType="huur" /> },
  { path: "/huurwoningen/:city?", element: <ListingTypePage listingType="huur" /> },
  { path: "/koopwoningen/:city/:filter", element: <FilteredLandingPage listingType="koop" /> },
  { path: "/koopwoningen/:city?", element: <ListingTypePage listingType="koop" /> },
  { path: "/appartementen/:city/:filter", element: <FilteredLandingPage propertyType="appartement" /> },
  { path: "/appartementen/:city?", element: <PropertyTypeCityPage propertyType="appartement" /> },
  { path: "/huizen/:city/:filter", element: <FilteredLandingPage propertyType="huis" /> },
  { path: "/huizen/:city?", element: <PropertyTypeCityPage propertyType="huis" /> },
  { path: "/studios/:city/:filter", element: <FilteredLandingPage propertyType="studio" /> },
  { path: "/studios/:city?", element: <PropertyTypeCityPage propertyType="studio" /> },
  { path: "/kamers/:city/:filter", element: <FilteredLandingPage propertyType="kamer" /> },
  { path: "/kamers/:city?", element: <PropertyTypeCityPage propertyType="kamer" /> },
  { path: "/woningen/:city/:filter", element: <FilteredLandingPage /> },
  { path: "/wijk/:city/:neighborhood", element: <NeighborhoodPage /> },
  { path: "/:city", element: <LegacyCityRedirect /> },
  { path: "/niet-gevonden", element: <NotFound /> },
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
              {LOCALE_PREFIXES.flatMap((prefix) =>
                PAGES.map((r) => {
                  // Root "/" → "/en", "/de", "/fr"
                  const path =
                    r.path === "/"
                      ? prefix === ""
                        ? "/"
                        : prefix
                      : prefix + r.path;
                  return <Route key={prefix + "::" + r.path} path={path} element={r.element} />;
                }),
              )}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
