import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PREFERRED_ADVERTISER } from "@/lib/preferredAdvertiser";
import { Button } from "@/components/ui/button";
import { trackDaisyconClick } from "@/hooks/usePageTracking";
import { ExternalLink, Zap } from "lucide-react";

export const usePreferredPartnerLink = () =>
  useQuery({
    queryKey: ["preferred-partner-link"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("daisycon_banners")
        .select("click_url")
        .ilike("advertiser_name", PREFERRED_ADVERTISER)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data?.click_url as string | undefined) ?? null;
    },
    staleTime: 30 * 60 * 1000,
  });

interface PartnerTipProps {
  title?: string;
  text?: string;
  buttonText?: string;
}

/**
 * Affiliate tipblok voor Huurzone.nl. Toont niets als er geen actieve
 * Huurzone.nl-link in de database staat.
 */
const PartnerTip = ({
  title = "Sneller reageren op woningen?",
  text = "Bekijk het actuele huurwoningaanbod bij Huurzone.nl.",
  buttonText = "Bekijk woningen bij Huurzone.nl",
}: PartnerTipProps) => {
  const { data: partnerLink } = usePreferredPartnerLink();
  if (!partnerLink) return null;

  const open = () => {
    trackDaisyconClick(null as any, partnerLink, PREFERRED_ADVERTISER);
    window.open(partnerLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
      <p className="flex items-center gap-2 font-semibold">
        <Zap className="h-4 w-4 text-primary" />
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      <Button type="button" className="mt-3 w-full gap-2" onClick={open}>
        {buttonText}
        <ExternalLink className="h-4 w-4" />
      </Button>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Advertentie</p>
    </div>
  );
};

export default PartnerTip;
