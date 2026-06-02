import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Zap, Calculator, Wifi, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Offer = {
  key: string;
  icon: typeof Zap;
  label: string;
  cta: string;
  href: string;
};

const OFFERS: Record<string, Offer> = {
  energie: {
    key: "energie",
    icon: Zap,
    label: "Bespaar tot € 600 op energie",
    cta: "Vergelijk gratis",
    href: "/energie",
  },
  hypotheek: {
    key: "hypotheek",
    icon: Calculator,
    label: "Bereken je maximale hypotheek",
    cta: "Start berekening",
    href: "/hypotheek-berekenen",
  },
  internet: {
    key: "internet",
    icon: Wifi,
    label: "Bespaar tot € 400 op internet & tv",
    cta: "Vergelijk nu",
    href: "/internet",
  },
};

/**
 * Detecteert onderwerp van blog op basis van titel + content keywords en toont
 * onderaan een sticky affiliate-bar. Verschijnt pas na 40% scrolldiepte.
 */
const BlogStickyAffiliateBar = ({ title, content }: { title: string; content: string }) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const text = `${title} ${content}`.toLowerCase();
  let offer: Offer = OFFERS.energie;
  if (/hypothe|kopen|koopwoning|maximale lening|nhg/i.test(text)) offer = OFFERS.hypotheek;
  else if (/internet|wifi|glasvezel|ziggo|kpn|odido/i.test(text)) offer = OFFERS.internet;
  else if (/energie|gas|stroom|verhuiz|overstap|nutsvoorz/i.test(text)) offer = OFFERS.energie;
  else if (/budget|huren|huur|huurprijs/i.test(text)) offer = OFFERS.energie;

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.4) setVisible(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;
  const Icon = offer.icon;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-card p-3 shadow-2xl sm:p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <p className="flex-1 text-sm font-medium leading-snug">{offer.label}</p>
        <Button
          asChild
          size="sm"
          className="shrink-0 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link to={offer.href}>
            {offer.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Sluiten"
          className="rounded-full p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BlogStickyAffiliateBar;
