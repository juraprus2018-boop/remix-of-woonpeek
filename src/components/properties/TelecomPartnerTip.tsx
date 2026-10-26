import { Wifi, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TELECOM_PARTNER_NAME, telecomPartnerUrl } from "@/lib/telecomPartner";

interface Props {
  city?: string | null;
  campaign?: string;
}

const TelecomPartnerTip = ({ city, campaign = "woning-detail" }: Props) => (
  <Card className="border-primary/20 bg-primary/5">
    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wifi className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">
            Ga je {city ? `in ${city}` : "hier"} wonen? Regel meteen je internet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Vergelijk internet, tv en mobiel en zie welke aanbieders op je nieuwe adres leveren.
          </p>
        </div>
      </div>
      <Button asChild className="shrink-0">
        <a href={telecomPartnerUrl(campaign)} target="_blank" rel="noopener">
          Vergelijk op {TELECOM_PARTNER_NAME} <ArrowRight className="ml-1 h-4 w-4" />
        </a>
      </Button>
    </CardContent>
  </Card>
);

export default TelecomPartnerTip;
