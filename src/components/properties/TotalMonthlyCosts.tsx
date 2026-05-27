import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Zap,
  Wifi,
  Shield,
  Droplet,
  Building2,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Average yearly energy cost (EUR) per m² of living area, by energy label. */
const ENERGY_PER_M2_PER_YEAR: Record<string, number> = {
  "A++": 11,
  "A+": 14,
  A: 17,
  B: 22,
  C: 28,
  D: 35,
  E: 44,
  F: 54,
  G: 66,
};

interface Props {
  basePrice: number;
  listingType: "huur" | "koop";
  energyLabel?: string | null;
  surfaceArea?: number | null;
  bedrooms?: number | null;
  city?: string;
  propertyId?: string;
}

const trackClick = (source: string, propertyId?: string) => {
  // Best-effort affiliate click tracking (matches existing daisycon_clicks pattern).
  try {
    void fetch("https://kppotnzwhxkflceiscto.supabase.co/rest/v1/daisycon_clicks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcG90bnp3aHhrZmxjZWlzY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDUxNzAsImV4cCI6MjA5NDIyMTE3MH0.LYl0kGnPwN_fy_nC9YsLvMkYUnU23NpFRKezd6Q0kOU",
      },
      body: JSON.stringify({
        source_url: source,
        source_site: "monthly-costs-calc",
        page_url: typeof window !== "undefined" ? window.location.href : null,
        property_id: propertyId ?? null,
      }),
    });
  } catch {
    /* swallow */
  }
};

/**
 * Total monthly cost calculator. Combines housing + energy + water + internet +
 * insurance + (for huur) municipal taxes into one realistic monthly figure, with
 * targeted comparison CTAs per cost line. Goal: give the visitor a true picture
 * of "wat kost wonen hier?" and convert each line into an affiliate click.
 */
const TotalMonthlyCosts = ({
  basePrice,
  listingType,
  energyLabel,
  surfaceArea,
  bedrooms,
  city,
  propertyId,
}: Props) => {
  // Housing line: mortgage estimate for koop (4.5% rate, 30y), or rent as-is.
  const housingDefault = useMemo(() => {
    if (listingType === "koop") {
      const annualRate = 0.045;
      const months = 360;
      const r = annualRate / 12;
      return Math.round((basePrice * r) / (1 - Math.pow(1 + r, -months)));
    }
    return Math.round(basePrice);
  }, [basePrice, listingType]);

  // Energy: from label + m², with reasonable fallback.
  const energyDefault = useMemo(() => {
    const label = energyLabel && ENERGY_PER_M2_PER_YEAR[energyLabel] ? energyLabel : "C";
    const area = surfaceArea && surfaceArea > 15 && surfaceArea < 2000 ? surfaceArea : 75;
    return Math.round((ENERGY_PER_M2_PER_YEAR[label] * area) / 12);
  }, [energyLabel, surfaceArea]);

  // Household-size dependent estimates.
  const household = Math.max(1, (bedrooms ?? 1) + 1);
  const waterDefault = Math.round(13 + household * 4); // Vitens avg ~17-29/mo
  const internetDefault = 45; // typical Ziggo/KPN/Odido package
  const insuranceDefault = listingType === "koop" ? 28 : 14; // inboedel (+opstal if koop)
  const municipalDefault = listingType === "koop" ? Math.round((basePrice / 1000) * 0.4) : 0;

  const [housing, setHousing] = useState(housingDefault);
  const [energy, setEnergy] = useState(energyDefault);
  const [water, setWater] = useState(waterDefault);
  const [internet, setInternet] = useState(internetDefault);
  const [insurance, setInsurance] = useState(insuranceDefault);
  const [municipal, setMunicipal] = useState(municipalDefault);

  const total = housing + energy + water + internet + insurance + municipal;

  // Reasonable savings estimates (annual). ACM/Consumentenbond benchmarks.
  const energySaving = 380;
  const internetSaving = 240;
  const insuranceSaving = 120;
  const totalYearlySaving = energySaving + internetSaving + insuranceSaving;

  type Line = {
    key: string;
    label: string;
    icon: typeof Zap;
    value: number;
    setter: (v: number) => void;
    cta?: { href: string; label: string; source: string; saving: number };
  };

  const lines: Line[] = [
    {
      key: "housing",
      label: listingType === "koop" ? "Hypotheek (indicatie)" : "Huur",
      icon: Wallet,
      value: housing,
      setter: setHousing,
    },
    {
      key: "energy",
      label: "Energie (gas + stroom)",
      icon: Zap,
      value: energy,
      setter: setEnergy,
      cta: {
        href: "/energie",
        label: `Bespaar tot € ${energySaving}/jr`,
        source: "monthly-costs-energy",
        saving: energySaving,
      },
    },
    {
      key: "water",
      label: "Water",
      icon: Droplet,
      value: water,
      setter: setWater,
    },
    {
      key: "internet",
      label: "Internet & TV",
      icon: Wifi,
      value: internet,
      setter: setInternet,
      cta: {
        href: "https://www.daisycon.com/nl/affiliate-marketing/internet-tv/",
        label: `Bespaar tot € ${internetSaving}/jr`,
        source: "monthly-costs-internet",
        saving: internetSaving,
      },
    },
    {
      key: "insurance",
      label: listingType === "koop" ? "Opstal + inboedel" : "Inboedelverzekering",
      icon: Shield,
      value: insurance,
      setter: setInsurance,
      cta: {
        href: "https://www.daisycon.com/nl/affiliate-marketing/verzekeringen/",
        label: `Bespaar tot € ${insuranceSaving}/jr`,
        source: "monthly-costs-insurance",
        saving: insuranceSaving,
      },
    },
  ];

  if (listingType === "koop") {
    lines.push({
      key: "municipal",
      label: "Gemeentebelastingen",
      icon: Building2,
      value: municipal,
      setter: setMunicipal,
    });
  }

  return (
    <Card className="overflow-hidden border-2 border-foreground bg-card">
      <CardContent className="p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Wat kost wonen hier écht?
            </p>
            <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">
              Totale maandlasten calculator
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Inclusief energie, internet en verzekering. Pas elk bedrag aan jouw situatie aan.
            </p>
          </div>
          <div className="rounded-xl border-2 border-accent bg-accent/10 px-5 py-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Totaal per maand
            </p>
            <p className="font-display text-3xl font-bold text-foreground md:text-4xl">
              € {total.toLocaleString("nl-NL")}
            </p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-border rounded-lg border bg-background">
          {lines.map(({ key, label, icon: Icon, value, setter, cta }) => (
            <div
              key={key}
              className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-4"
            >
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <Label
                  htmlFor={`cost-${key}`}
                  className="flex-1 text-sm font-medium text-foreground"
                >
                  {label}
                </Label>
              </div>
              <div className="flex items-center gap-2 md:w-64 md:justify-end">
                <span className="text-sm text-muted-foreground">€</span>
                <Input
                  id={`cost-${key}`}
                  type="number"
                  min={0}
                  value={value}
                  onChange={(e) => setter(Math.max(0, Number(e.target.value) || 0))}
                  className="h-9 w-24 text-right font-display font-bold"
                />
                <span className="text-xs text-muted-foreground">/mnd</span>
              </div>
              <div className="md:w-44 md:text-right">
                {cta ? (
                  cta.href.startsWith("http") ? (
                    <a
                      href={cta.href}
                      target="_blank"
                      rel="nofollow sponsored noopener"
                      onClick={() => trackClick(cta.source, propertyId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      {cta.label} <ArrowRight className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      to={cta.href}
                      onClick={() => trackClick(cta.source, propertyId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      {cta.label} <ArrowRight className="h-3 w-3" />
                    </Link>
                  )
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-xl border-2 border-accent/40 bg-accent/5 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <p className="text-sm text-foreground">
              Door over te stappen van energie, internet én verzekering kun je samen tot{" "}
              <strong>€ {totalYearlySaving} per jaar</strong> besparen
              {city ? ` in ${city}` : ""}. Dat is{" "}
              <strong>€ {Math.round(totalYearlySaving / 12)} per maand</strong> minder uit.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="shrink-0 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link to="/energie" onClick={() => trackClick("monthly-costs-cta", propertyId)}>
              Start vergelijken
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Indicatie op basis van Nibud, ACM en Consumentenbond gemiddelden. Werkelijke bedragen
          kunnen verschillen per huishouden en aanbieder. Vergelijken via Daisycon (affiliate).
        </p>
      </CardContent>
    </Card>
  );
};

export default TotalMonthlyCosts;
