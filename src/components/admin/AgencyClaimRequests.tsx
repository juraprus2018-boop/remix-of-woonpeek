import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CANONICAL_URL } from "@/lib/brand";

const STATUSES = ["nieuw", "benaderd", "geclaimd", "afgewezen"] as const;

export const outreachTemplate = (name = "[Kantoornaam]", city = "[plaats]") => {
  const link = `${CANONICAL_URL}/makelaars/claim?kantoor=${encodeURIComponent(name)}&plaats=${encodeURIComponent(city)}`;
  return `Onderwerp: Uw kantoorpagina op Woonaanbod NL staat klaar

Beste ${name},

Elke dag zoeken woningzoekers op Woonaanbod NL naar woningen in ${city}. We hebben een plek voor uw kantoor klaargezet.

Claim uw pagina gratis en koppel uw XML-feed of Realworks-export. Uw aanbod staat dan direct online, zonder kosten of abonnement:
${link}

Met vriendelijke groet,
Woonaanbod NL`;
};

const AgencyClaimRequests = () => {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["agency-claims"],
    queryFn: async () => {
      const { data } = await supabase.from("agency_claim_requests").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("agency_claim_requests").update({ status }).eq("id", id);
    if (error) toast({ title: "Bijwerken mislukt", variant: "destructive" });
    qc.invalidateQueries({ queryKey: ["agency-claims"] });
  };

  const copy = async (name?: string, city?: string | null) => {
    await navigator.clipboard.writeText(outreachTemplate(name, city || undefined));
    toast({ title: "Outreach-mail gekopieerd" });
  };

  return (
    <section className="mt-10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Claim-aanvragen ({data.length})</h2>
        <Button variant="outline" onClick={() => copy()}>Kopieer outreach-sjabloon</Button>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nog geen aanvragen.</p>
      ) : (
        <div className="space-y-2">
          {data.map((r: any) => (
            <div key={r.id} className="flex flex-col gap-2 rounded-lg border bg-card p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{r.office_name} {r.city && <span className="text-muted-foreground">· {r.city}</span>}</p>
                <p className="text-sm text-muted-foreground">{[r.contact_name, r.email, r.phone, r.website].filter(Boolean).join(" · ")}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("nl-NL")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{r.status}</Badge>
                {STATUSES.filter((s) => s !== r.status).map((s) => (
                  <Button key={s} size="sm" variant="outline" onClick={() => setStatus(r.id, s)}>{s}</Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => copy(r.office_name, r.city)}>Mail kopiëren</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AgencyClaimRequests;
