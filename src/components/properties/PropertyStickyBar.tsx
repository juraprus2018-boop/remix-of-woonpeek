import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bed, Maximize, ExternalLink, Mail, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackDaisyconClick } from "@/hooks/usePageTracking";
import { normalizeAffiliateUrl } from "@/lib/affiliateUrl";

interface PropertyStickyBarProps {
  propertyId: string;
  title: string;
  city: string;
  price: number;
  listingType: string;
  bedrooms?: number | null;
  surfaceArea?: number | null;
  sourceUrl?: string | null;
  sourceSite?: string | null;
  energyLabel?: string | null;
  /** Element to observe; bar appears once it scrolls out of view */
  triggerRef: React.RefObject<HTMLElement>;
  /** Fallback contact handler when no external/affiliate URL is available */
  onContact?: () => void;
}

const PropertyStickyBar = ({
  propertyId,
  title,
  city,
  price,
  listingType,
  bedrooms,
  surfaceArea,
  sourceUrl,
  sourceSite,
  energyLabel,
  triggerRef,
  onContact,
}: PropertyStickyBarProps) => {
  const [visible, setVisible] = useState(false);
  const showEnergyBadge = !!energyLabel && ["D", "E", "F", "G"].includes(energyLabel.toUpperCase());

  useEffect(() => {
    const target = triggerRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [triggerRef]);

  const formattedPrice = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  const normalizedSourceUrl = normalizeAffiliateUrl(sourceUrl);

  const handleReact = () => {
    if (normalizedSourceUrl) {
      trackDaisyconClick(propertyId, normalizedSourceUrl, sourceSite || null);
      window.open(normalizedSourceUrl, "_blank", "noopener,noreferrer");
    } else if (onContact) {
      onContact();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-20 md:top-24 z-[55] border-b border-border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85 transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}
      aria-hidden={!visible}
    >
      <div className="container flex items-center justify-between gap-3 py-2.5 sm:py-3">
        {/* Info: price + features */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate font-display text-base font-bold text-foreground sm:text-lg">
              {formattedPrice}
              {listingType === "huur" && (
                <span className="text-xs font-medium text-muted-foreground sm:text-sm"> /mnd</span>
              )}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground sm:gap-3 sm:text-sm">
            <span className="truncate font-medium text-foreground/80">{city}</span>
            {bedroomsLabel(bedrooms) && (
              <span className="hidden items-center gap-1 sm:flex">
                <Bed className="h-3.5 w-3.5" />
                {bedrooms}
              </span>
            )}
            {surfaceArea ? (
              <span className="hidden items-center gap-1 sm:flex">
                <Maximize className="h-3.5 w-3.5" />
                {surfaceArea} m²
              </span>
            ) : null}
          </div>
        </div>

        {/* CTA group */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {showEnergyBadge && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden gap-1.5 border-amber-500/50 text-amber-700 hover:bg-amber-500/10 md:flex"
              title={`Energielabel ${energyLabel} — bespaar via vergelijker`}
            >
              <Link to="/energie">
                <Zap className="h-3.5 w-3.5" />
                Label {energyLabel} – bespaar
              </Link>
            </Button>
          )}
          <Button
            onClick={handleReact}
            size="sm"
            className="gap-1.5 whitespace-nowrap"
          >
            {normalizedSourceUrl ? (
              <>
                <ExternalLink className="h-4 w-4" />
                Reageer
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Reageer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const bedroomsLabel = (b?: number | null) => (b && b > 0 ? `${b}` : null);

export default PropertyStickyBar;