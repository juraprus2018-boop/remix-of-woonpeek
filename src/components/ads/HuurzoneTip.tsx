import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { trackDaisyconClick } from "@/hooks/usePageTracking";
import { ExternalLink, Zap } from "lucide-react";

export const useHuurzoneLink = () =>
  useQuery({
    queryKey: ["huurzone-link"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("daisycon_banners")
        .select("click_url")
        .ilike("advertiser_name", "huurzone%")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      return (data?.click_url as string | undefined) ?? null;
    },
    staleTime: 30 * 60 * 1000,
  });

interface HuurzoneTipProps {
  title?: string;
  text?: string;
  buttonText?: string;
}

/**
 * Affiliate tipblok voor Huurzone. Toont niets als er geen actieve
 * Huurzone-link in de database staat.
 */
const HuurzoneTip = ({
  title = "Sneller reageren op woningen?",
  text = "Met een gratis account bij Huurzone reageer je direct op woningen van particuliere verhuurders.",
  buttonText = "Maak een gratis account bij Huurzone",
}: HuurzoneTipProps) => {
  const { data: huurzone } = useHuurzoneLink();
  if (!huurzone) return null;

  const open = () => {
    trackDaisyconClick(null as any, huurzone, "huurzone.nl");
    window.open(huurzone, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
      <p className="flex items-center gap-2 font-semibold">
        <Zap className="h-4 w-4 text-primary" />
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      <Button className="mt-3 w-full gap-2" onClick={open}>
        {buttonText}
        <ExternalLink className="h-4 w-4" />
      </Button>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Advertentie</p>
    </div>
  );
};

export default HuurzoneTip;
