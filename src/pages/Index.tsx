import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TopAlertBar from "@/components/layout/TopAlertBar";
import CitySkyline from "@/components/layout/CitySkyline";
import HeroSection from "@/components/home/HeroSection";
import FeaturedListings from "@/components/home/FeaturedListings";
import PopularCities from "@/components/home/PopularCities";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import DailyAlertSection from "@/components/home/DailyAlertSection";
import CityMapSection from "@/components/home/CityMapSection";
import SEOContentSection from "@/components/home/SEOContentSection";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import SEOHead from "@/components/seo/SEOHead";
import AdSlot from "@/components/ads/AdSlot";
import IncomeChecker from "@/components/home/IncomeChecker";
import TrustStats from "@/components/home/TrustStats";
import TestimonialsSection from "@/components/home/TestimonialsSection";

const Index = () => {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Domora",
    url: "https://domora.com",
    logo: "https://domora.com/favicon.png",
    sameAs: ["https://www.facebook.com/woonpeek"],
    description:
      "Domora verzamelt dagelijks het nieuwste woningaanbod uit heel Nederland op één plek.",
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Domora",
    url: "https://domora.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://domora.com/zoeken?city={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Domora – Huurwoningen & Koophuizen in Nederland"
        description="Ontdek nieuwe huurwoningen en koopwoningen zodra ze online komen. Domora verzamelt dagelijks het nieuwste woningaanbod uit heel Nederland op één plek."
        canonical="https://domora.com"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <TopAlertBar />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustStats />
        <FeaturedListings />
        <RecentlyViewed />
        <div className="container">
          <AdSlot slotKey="homepage" />
        </div>
        <HowItWorksSection />
        <PopularCities />
        <IncomeChecker />
        <WhyUsSection />
        <TestimonialsSection />
        <DailyAlertSection />
        <CityMapSection />
        <SEOContentSection />
      </main>
      <CitySkyline />
      <Footer />
      <ExitIntentPopup />
    </div>
  );
};

export default Index;
