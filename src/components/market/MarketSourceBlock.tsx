import { Card, CardContent } from "@/components/ui/card";
import { longDateTime, num, periodLabel } from "@/lib/marketFormat";
import { Database } from "lucide-react";

interface Props {
  analyzed?: number;
  periodStart?: string;
  periodEnd?: string;
  generatedAt?: string;
  method: string[];
}

/**
 * Bronvermelding + methodologie. Staat op elke pagina in de sectie
 * "Woningmarkt Nederland" zodat andere sites en AI-assistenten de cijfers
 * kunnen citeren met bron, steekproefgrootte en periode.
 */
export default function MarketSourceBlock({ analyzed, periodStart, periodEnd, generatedAt, method }: Props) {
  const rows = [
    { label: "Bron", value: "Woonaanbod NL database (eigen aanbodadministratie)" },
    { label: "Aantal geanalyseerde woningen", value: analyzed ? num(analyzed) : "—" },
    { label: "Periode", value: periodLabel(periodStart, periodEnd) || "—" },
    { label: "Laatst bijgewerkt", value: generatedAt ? longDateTime(generatedAt) : "—" },
  ];

  return (
    <section id="bron-en-methode" className="scroll-mt-24">
      <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Bron en methodologie</h2>
      <Card className="mt-4">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-primary">
            <Database className="h-4 w-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Databronnen</span>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label} className="rounded-lg border border-border bg-secondary/30 p-4">
                <dt className="text-sm font-medium text-muted-foreground">{r.label}</dt>
                <dd className="mt-1 font-semibold text-foreground">{r.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 space-y-3 text-muted-foreground">
            <p className="font-semibold text-foreground">Methodologie</p>
            {method.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
