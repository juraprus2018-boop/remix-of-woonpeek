import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";
import { PUBLIC_AGENCY_COLUMNS, logAgencyEvent, type Agency } from "@/lib/agency";

/** "Aangeboden door [makelaar]" op de woningpagina; telt ook een vertoning. */
const AgencyBadge = ({ agencyId, propertyId }: { agencyId: string; propertyId: string }) => {
  const { data: agency } = useQuery({
    queryKey: ["agency-by-id", agencyId],
    queryFn: async () => (await supabase.from("agencies").select(PUBLIC_AGENCY_COLUMNS).eq("id", agencyId).maybeSingle()).data as unknown as Agency | null,
  });
  useEffect(() => { logAgencyEvent(agencyId, "view", propertyId); }, [agencyId, propertyId]);
  if (!agency) return null;
  return (
    <Link to={`/makelaars/${agency.slug}`} className="flex items-center gap-3 rounded-lg border bg-background p-3 hover:border-primary">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-card">
        {agency.logo_url ? <img src={agency.logo_url} alt="" className="h-full w-full object-contain" /> : <Building2 className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="text-sm">
        <div className="text-muted-foreground">Aangeboden door</div>
        <div className="font-semibold text-foreground">{agency.name}</div>
      </div>
    </Link>
  );
};
export default AgencyBadge;
