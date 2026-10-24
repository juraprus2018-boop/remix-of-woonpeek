import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gauge, ExternalLink, RotateCcw } from "lucide-react";
import { usePreferredPartnerLink } from "@/components/ads/PartnerTip";
import { trackDaisyconClick } from "@/hooks/usePageTracking";

interface Props {
  price: number;
  city: string;
}

type Speed = "direct" | "maand" | "later";

/**
 * Indicatieve kansinschatting op basis van de gangbare 3x-huur inkomenseis
 * en verhuisbereidheid. Geen verzonnen reactie-aantallen.
 */
const ChanceEstimator = ({ price, city }: Props) => {
  const { data: partnerLink } = usePreferredPartnerLink();
  const [income, setIncome] = useState("");
  const [speed, setSpeed] = useState<Speed | null>(null);
  const [done, setDone] = useState(false);

  if (!price || price <= 0) return null;
  const required = Math.round(price * 3);
  const inc = Number(income.replace(/\D/g, ""));
  const ratio = inc / required;

  let score = ratio >= 1.2 ? 3 : ratio >= 1 ? 2 : ratio >= 0.8 ? 1 : 0;
  if (speed === "direct") score += 1;
  if (speed === "later") score -= 1;
  const level = score >= 3 ? "Goed" : score >= 2 ? "Redelijk" : "Klein";
  const pct = Math.max(10, Math.min(95, score * 25 + 10));

  const advice =
    ratio < 1
      ? `De meeste verhuurders vragen een bruto inkomen van ongeveer €${required.toLocaleString("nl-NL")} per maand (3x de huur). Een garantsteller of samen huren kan helpen.`
      : speed === "later"
        ? "Je inkomen past, maar verhuurders kiezen vaak iemand die snel kan verhuizen."
        : "Je inkomen past bij deze woning. Snelheid is nu het belangrijkste: wie als eerste reageert, maakt de meeste kans.";

  const openHz = () => {
    if (!partnerLink) return;
    trackDaisyconClick(null as any, partnerLink, "Huurzone.nl");
    window.open(partnerLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-2xl border-2 border-accent/30 bg-card p-4">
      <p className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <Gauge className="h-5 w-5 text-accent" /> Hoe groot is jouw kans?
      </p>
      {!done ? (
        <div className="mt-3 space-y-3">
          <label className="block text-sm font-medium">
            Bruto maandinkomen (huishouden)
            <Input inputMode="numeric" placeholder="bijv. 4500" value={income} maxLength={7}
              onChange={(e) => setIncome(e.target.value.replace(/\D/g, ""))} className="mt-1" />
          </label>
          <div>
            <p className="text-sm font-medium">Wanneer kun je verhuizen?</p>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {([["direct", "Direct"], ["maand", "Binnen 1 mnd"], ["later", "Later"]] as [Speed, string][]).map(([v, l]) => (
                <Button key={v} type="button" size="sm" variant={speed === v ? "default" : "outline"} onClick={() => setSpeed(v)}>{l}</Button>
              ))}
            </div>
          </div>
          <Button className="w-full" disabled={!inc || !speed} onClick={() => setDone(true)}>Bereken mijn kans</Button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Indicatie voor {city}</span>
              <span className="font-display text-xl font-bold text-foreground">{level}</span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{advice}</p>
          {partnerLink && (
            <>
              <Button className="w-full gap-2" onClick={openHz}>
                Bekijk ook woningen bij Huurzone.nl <ExternalLink className="h-4 w-4" />
              </Button>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Advertentie · Partner</p>
            </>
          )}
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:underline" onClick={() => setDone(false)}>
            <RotateCcw className="h-3 w-3" /> Opnieuw
          </button>
        </div>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">Indicatie op basis van de gangbare inkomenseis. Geen garantie.</p>
    </div>
  );
};

export default ChanceEstimator;
