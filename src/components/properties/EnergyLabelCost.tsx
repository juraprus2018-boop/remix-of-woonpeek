import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, TrendingDown, ChevronDown, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DaisyconEnergyWidget from "@/components/energy/DaisyconEnergyWidget";

/**
 * Estimated yearly energy cost in EUR per m² of living area, derived from
 * Nibud / Milieu Centraal averages for an average Dutch household.
 * These are approximations; we frame them as "indication" in the UI.
 */
const COST_PER_M2_PER_YEAR: Record<string, number> = {
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
  energyLabel?: string | null;
  surfaceArea?: number | null;
  city?: string;
}

/**
 * Conversion-focused energy block for property detail. Shows an estimated
 * monthly energy bill for the specific home (label + m²) and how much could
 * be saved by switching providers, with a clear Daisycon CTA.
 */
const EnergyLabelCost = ({ energyLabel, surfaceArea, city }: Props) => {
  const [open, setOpen] = useState(false);

  const label = energyLabel && COST_PER_M2_PER_YEAR[energyLabel] ? energyLabel : null;
  const area = surfaceArea && surfaceArea > 15 && surfaceArea < 2000 ? surfaceArea : null;

  // Fallback to label A (best case) for delta calc; if no label/area we still
  // show a generic, useful CTA tailored to the city.
  const yearly = label && area ? Math.round((COST_PER_M2_PER_YEAR[label] * area) / 10) * 10 : null;
  const monthly = yearly ? Math.round(yearly / 12) : null;
  const bestCaseYearly = area ? Math.round((COST_PER_M2_PER_YEAR["A"] * area) / 10) * 10 : null;
  const yearlyDelta = yearly && bestCaseYearly ? Math.max(0, yearly - bestCaseYearly) : 0;
  // Switching providers saves on average €380/year (ACM data, 2024-2025)
  const switchSaving = 380;

  return (
    <Card className="overflow-hidden border-2 border-foreground bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <CardContent className="p-5 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
          {/* Stat block */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Energie in deze woning
                </p>
                <h3 className="font-display text-lg font-bold text-foreground md:text-xl">
                  {monthly
                    ? `Indicatie: € ${monthly} per maand`
                    : "Bespaar op je energierekening"}
                </h3>
              </div>
            </div>

            {monthly ? (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Per jaar</p>
                  <p className="font-display text-xl font-bold text-foreground">€ {yearly}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Op basis van label {label} en {area} m²
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingDown className="h-3 w-3" /> Mogelijke besparing
                  </p>
                  <p className="font-display text-xl font-bold text-accent">
                    € {switchSaving}
                    <span className="text-xs font-medium text-muted-foreground"> / jaar</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Door over te stappen
                  </p>
                </div>
                {yearlyDelta > 50 && (
                  <div className="col-span-2 flex items-start gap-2 rounded-lg bg-accent/10 p-3 text-xs text-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <span>
                      Label {label} betekent ongeveer <strong>€ {yearlyDelta} per jaar meer</strong>{" "}
                      stookkosten dan een vergelijkbare woning met label A. Een scherp contract maakt
                      een groot deel daarvan goed.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Verhuis je naar {city ? `een nieuwe plek in ${city}` : "deze woning"}? Vergelijk
                gas en stroom van alle leveranciers en bespaar gemiddeld € {switchSaving} per jaar.
              </p>
            )}
          </div>

          {/* CTA block */}
          <div className="flex flex-col justify-center gap-2 lg:w-64 lg:border-l lg:pl-5">
            <Button
              asChild
              size="lg"
              className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/energie">
                Vergelijk energie
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen((o) => !o)}
              className="w-full gap-1.5"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
              {open ? "Verberg vergelijker" : "Direct hier vergelijken"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Onafhankelijk vergelijken via Daisycon
            </p>
          </div>
        </div>

        {open && (
          <div className="mt-6 border-t pt-6">
            <DaisyconEnergyWidget />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnergyLabelCost;
