import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitionMeterProps {
  /** Echt totaal uit de woninggegevens; bij nul tonen we geen interesseclaim. */
  viewsCount: number;
  className?: string;
}

/** Toont uitsluitend de geregistreerde totale weergaven, nooit gesimuleerde vraag of urgentie. */
const CompetitionMeter = ({ viewsCount, className }: CompetitionMeterProps) => {
  if (!Number.isFinite(viewsCount) || viewsCount <= 0) return null;

  return (
    <section className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)} aria-label="Interesse in deze woning">
      <div className="flex items-start gap-3">
        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Interesse in deze woning</h3>
          <p className="mt-1 text-sm text-foreground">
            <strong className="font-semibold">{viewsCount.toLocaleString("nl-NL")}</strong> geregistreerde weergaven op Woonaanbod NL
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Dit is het totaal sinds publicatie, geen live telling of aantal reacties.</p>
        </div>
      </div>
    </section>
  );
};

export default CompetitionMeter;
