import { TrendingUp, Search, Bell, Shield, Zap, Heart } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Woningaanbod op één plek",
    description: "Bekijk huurwoningen van verschillende aanbieders op één plek.",
  },
  {
    icon: Search,
    title: "Alles op één plek",
    description: "Gebruik filters om het aanbod te bekijken op locatie, woningtype en prijs.",
  },
  {
    icon: Bell,
    title: "Gratis alerts",
    description: "Mail in je inbox zodra er iets binnenkomt dat in jouw straatje past.",
  },
  {
    icon: Shield,
    title: "Bekijk de aanbieder",
    description: "Controleer de bronvermelding en voorwaarden van de aanbieder voordat je reageert.",
  },
  {
    icon: TrendingUp,
    title: "Bekijk recent aanbod",
    description: "Bekijk woningen die recent aan het aanbod zijn toegevoegd.",
  },
  {
    icon: Heart,
    title: "Zoeken zonder abonnement",
    description: "Je kunt woningen op de site bekijken. Eventuele voorwaarden staan bij de betreffende functie.",
  },
];

const WhyUsSection = () => {
  return (
    <section className="bg-surface-cream py-16 md:py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Waarom Woonaanbod NL?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Omdat huren zoeken al stressvol genoeg is.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-border bg-background p-7 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
