import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Globe, FileText, Briefcase, GraduationCap, Building2, Wallet } from "lucide-react";

interface ExpatCity {
  name: string;
  slug: string;
  note: string;
}

const TOP_CITIES: ExpatCity[] = [
  { name: "Amsterdam", slug: "amsterdam", note: "Largest expat community, most English-speaking jobs." },
  { name: "The Hague", slug: "den-haag", note: "Diplomatic hub, international organisations, beach close by." },
  { name: "Rotterdam", slug: "rotterdam", note: "Modern architecture, big tech scene, cheaper than Amsterdam." },
  { name: "Utrecht", slug: "utrecht", note: "Central location, student city, very well connected." },
  { name: "Eindhoven", slug: "eindhoven", note: "Tech and engineering centre, home of ASML and Philips." },
  { name: "Groningen", slug: "groningen", note: "University city in the north, affordable and lively." },
];

const ExpatHousing = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How hard is it to find housing as an expat in the Netherlands?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It is genuinely hard in 2025. Demand outstrips supply in every major city. Most rentals in the free sector go within a week and landlords often ask for an income of 3 to 4 times the monthly rent. Starting your search at least 2 months before moving is realistic.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need a BSN to rent a house?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A BSN (citizen service number) is not strictly required to sign a lease, but most professional landlords will ask for it once you arrive. You register at the gemeente within 5 days of arriving and the BSN is issued on the spot.",
        },
      },
      {
        "@type": "Question",
        name: "What is the 30% ruling and does it affect housing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The 30% ruling is a tax advantage for highly skilled migrants: up to 30% of your gross salary is tax-free for a limited period. It increases your net income and therefore the rent you qualify for. Landlords often understand the ruling and accept payslips that reflect it.",
        },
      },
      {
        "@type": "Question",
        name: "What is a reasonable rent budget in the Netherlands?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A one-bedroom apartment in Amsterdam costs € 1.800 to € 2.500 per month. In Rotterdam or Utrecht expect € 1.400 to € 1.900. In smaller cities like Eindhoven or Groningen € 1.000 to € 1.500 is realistic. These prices include utilities only sometimes.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Expat housing in the Netherlands: 2025 guide | Huurbaasje"
        description="Moving to the Netherlands? Practical English guide on finding housing, BSN, 30% ruling, deposits and the best expat cities. Free daily rental alerts included."
      />
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <section className="border-b-2 border-foreground bg-card">
          <div className="container py-10 md:py-14">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Expat housing" }]} />
            <div className="mt-6 flex items-start gap-4">
              <div className="rounded-xl border-2 border-foreground bg-accent/10 p-3">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-5xl lowercase text-foreground">
                  living as an expat in the netherlands
                </h1>
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  Honest guide for international professionals and families moving to the
                  Netherlands. Housing, paperwork, taxes and where to live. Updated for 2025.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground py-12">
          <div className="container grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-10">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl lowercase">
                  <Building2 className="h-5 w-5 text-primary" /> finding a rental
                </h2>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>
                    The Dutch rental market splits in two: social housing (waiting lists of 4 to 14
                    years, basically not an option for newcomers) and the free sector (private
                    rentals, no waiting list, but pricey). As an expat you will almost always be in
                    the free sector.
                  </p>
                  <p>
                    Most listings are gone within days. Set up alerts as soon as you know your
                    arrival date. Landlords typically ask for income of three to four times the
                    monthly rent, a Dutch employment contract and a deposit of one or two months.
                  </p>
                  <p>
                    Furnished apartments are common in expat-heavy areas but cost 15 to 25% more
                    than unfurnished. Unfurnished in the Netherlands often means really empty: no
                    flooring, no light fixtures.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl lowercase">
                  <FileText className="h-5 w-5 text-primary" /> paperwork and bsn
                </h2>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>
                    Within 5 days of arrival, register at the gemeente of the city where you live.
                    Bring a valid passport, your rental contract and proof of address. You receive a
                    BSN on the spot, which you need for almost everything: bank account, health
                    insurance, employer, doctor.
                  </p>
                  <p>
                    Open a Dutch bank account quickly. ABN AMRO, ING and Bunq all support English
                    onboarding. A Dutch IBAN is essential because many landlords refuse foreign
                    accounts for the deposit and rent.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl lowercase">
                  <Wallet className="h-5 w-5 text-primary" /> the 30% ruling
                </h2>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>
                    If you are recruited from abroad and meet the salary criteria, you qualify for
                    the 30% ruling: up to 30% of your gross salary is tax-free. In 2025 the rule was
                    reformed, with a stepwise reduction over the years, but it is still significant.
                  </p>
                  <p>
                    Apply through your employer. Most international employers handle this for you
                    within the first month. The benefit shows up directly in your payslip and
                    increases the rent landlords are willing to approve.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl lowercase">
                  <GraduationCap className="h-5 w-5 text-primary" /> schools and family
                </h2>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>
                    International schools are available in Amsterdam, The Hague, Rotterdam, Utrecht
                    and Eindhoven. Tuition ranges from € 7.000 to € 25.000 per year. Demand is high,
                    so apply months ahead. Dutch state schools are free and excellent, but the
                    language barrier means most expat kids start in the international stream.
                  </p>
                  <p>
                    Childcare (kinderopvang) is heavily subsidised through the kinderopvangtoeslag,
                    but waiting lists in popular areas run to 6 months or more.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl lowercase">
                  <Briefcase className="h-5 w-5 text-primary" /> work and career
                </h2>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>
                    English-speaking jobs cluster in Amsterdam (tech, finance, marketing), The Hague
                    (international organisations, legal), Eindhoven (engineering, semiconductors)
                    and Rotterdam (logistics, energy). Outside the Randstad an English-only job is
                    rarer and learning Dutch is recommended.
                  </p>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border-2 border-foreground bg-accent/10 p-5">
                <h3 className="font-display text-lg lowercase">free daily rental alert</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set your filters once. We email you the moment a matching apartment appears. No
                  registration fee.
                </p>
                <Link
                  to="/woonradar"
                  className="mt-3 inline-flex items-center rounded-lg border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
                >
                  Set up alert
                </Link>
              </div>

              <div className="rounded-2xl border-2 border-foreground bg-card p-5">
                <h3 className="font-display text-lg lowercase">budget calculator</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Find out how much rent you can realistically afford based on your gross salary
                  (works with 30% ruling).
                </p>
                <Link
                  to="/budgetcheck"
                  className="mt-3 inline-flex items-center rounded-lg border-2 border-foreground bg-background px-4 py-2 text-sm font-medium hover:bg-accent/10"
                >
                  Check budget
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-card py-12">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl lowercase">best cities for expats</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOP_CITIES.map((c) => (
                <Link
                  key={c.slug}
                  to={`/stad/${c.slug}`}
                  className="rounded-2xl border-2 border-foreground bg-background p-5 transition-colors hover:bg-accent/10"
                >
                  <p className="font-display text-lg lowercase">{c.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ExpatHousing;
