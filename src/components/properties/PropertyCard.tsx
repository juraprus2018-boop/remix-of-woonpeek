import { Link } from "react-router-dom";
import {
  Heart,
  Bed,
  Maximize,
  MapPin,
  Zap,
  Share2,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { useFeedLogos } from "@/hooks/useFeedLogos";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";
import propertyPlaceholder from "@/assets/property-placeholder.jpg";
import { optimizeImage, buildSrcSet } from "@/lib/imageOptimization";
import { getStockPropertyImage } from "@/lib/stockImages";

type Property = Database["public"]["Tables"]["properties"]["Row"];

interface PropertyCardProps {
  property: Property;
  /** Average price for this property type in the same city (used for deal labels) */
  cityAvgPrice?: number;
  /** Optional: user's gross monthly income (for affordability indicator on rentals) */
  userIncome?: number;
  /** When true, the card hints the browser to fetch the image with high priority. */
  priority?: boolean;
}

const euro = (value: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const PropertyCard = ({ property, cityAvgPrice, userIncome, priority = false }: PropertyCardProps) => {
  const { user } = useAuth();
  const { toggle, isFavorite, isLoading } = useToggleFavorite();
  const { data: feedLogos } = useFeedLogos();
  const isPropertyFavorite = isFavorite(property.id);

  const sourceLogo =
    feedLogos && property.source_site ? feedLogos[property.source_site.toLowerCase()] : undefined;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) toggle(property.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/aanbod/${property.slug || property.id}`;
    if (navigator.share) {
      navigator.share({ title: property.title, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const hoursAgo = (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60);
  const isToday = hoursAgo < 24;
  const isNew = hoursAgo < 7 * 24;
  const days = Math.floor(hoursAgo / 24);
  const daysAgoLabel = days <= 0 ? "vandaag" : days === 1 ? "gisteren" : `${days} dagen geleden`;

  const dealLabel = (() => {
    if (!cityAvgPrice || cityAvgPrice <= 0) return null;
    const diff = (Number(property.price) - cityAvgPrice) / cityAvgPrice;
    if (diff <= -0.15) return "goede-deal";
    if (diff >= 0.15) return "te-duur";
    return null;
  })();

  const requiredIncome = Number(property.price) * 3;
  const fitsBudget =
    property.listing_type === "huur" && userIncome && userIncome > 0
      ? userIncome >= requiredIncome
      : null;

  const heroSrc = property.images?.[0] ?? getStockPropertyImage(property.id);
  const hasOwn = !!property.images?.[0];

  const subtitle = [
    property.property_type,
    property.bedrooms ? `${property.bedrooms} kamers` : null,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <Link to={`/aanbod/${property.slug || property.id}`} className="group block" aria-label={property.title}>
      <article
        className={cn(
          "relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-lg sm:flex-row",
          property.status !== "actief" && "opacity-75"
        )}
      >
        {/* Image */}
        <div className="relative w-full shrink-0 overflow-hidden sm:w-[280px] lg:w-[320px]">
          <div className="aspect-[16/10] h-full w-full sm:aspect-auto sm:h-[220px]">
            <picture>
              {hasOwn && (
                <source
                  type="image/webp"
                  srcSet={buildSrcSet(heroSrc, [320, 480, 640], 400, 74, "webp")}
                  sizes="(max-width: 640px) 100vw, 320px"
                />
              )}
              <img
                src={hasOwn ? optimizeImage(heroSrc, { width: 640, height: 400, quality: 74 }) : heroSrc}
                alt={property.title}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                width={640}
                height={400}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.src = propertyPlaceholder;
                  e.currentTarget.srcset = "";
                }}
              />
            </picture>
          </div>

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {property.status !== "actief" && (
              <Badge variant="destructive" className="text-xs capitalize">
                {property.status}
              </Badge>
            )}
            {isToday && property.status === "actief" && (
              <Badge className="bg-accent text-accent-foreground text-xs font-semibold">Nieuw vandaag</Badge>
            )}
            {!isToday && isNew && property.status === "actief" && (
              <Badge className="bg-accent/80 text-accent-foreground text-xs">Nieuw</Badge>
            )}
            {dealLabel === "goede-deal" && (
              <Badge className="bg-success text-success-foreground text-xs font-semibold">Goede deal</Badge>
            )}
            {dealLabel === "te-duur" && (
              <Badge className="bg-destructive/80 text-destructive-foreground text-xs">Boven gemiddeld</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="absolute right-3 top-3 flex gap-1.5">
            {user && (
              <Button
                size="icon"
                variant="secondary"
                className={cn(
                  "h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm",
                  isPropertyFavorite && "text-destructive"
                )}
                onClick={handleFavoriteClick}
                disabled={isLoading}
                aria-label="Bewaar woning"
              >
                <Heart className={cn("h-4 w-4", isPropertyFavorite && "fill-current")} />
              </Button>
            )}
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm"
              onClick={handleShareClick}
              aria-label="Deel woning"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {sourceLogo && (
            <div className="absolute right-3 bottom-3 h-7 w-7 rounded-md bg-background/90 p-0.5 shadow-sm">
              <img
                src={sourceLogo}
                alt={property.source_site || "Aanbieder"}
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 p-5 md:flex-row md:gap-6">
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold leading-snug text-foreground line-clamp-2">
              {property.title}
            </h3>
            {subtitle && <p className="mt-1 text-sm font-semibold capitalize text-muted-foreground">{subtitle}</p>}
            {property.description && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{property.description}</p>
            )}
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">
                {property.street} {property.house_number}, {property.city}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <Badge variant="secondary" className="capitalize">
                {property.property_type}
              </Badge>
              {property.postal_code && <Badge variant="outline">{property.postal_code}</Badge>}
              {property.neighborhood && (
                <Badge variant="outline" className="capitalize">
                  {property.neighborhood}
                </Badge>
              )}
              {property.build_year && <Badge variant="outline">Bouwjaar {property.build_year}</Badge>}
              {property.surface_area && Number(property.price) > 0 && (
                <Badge variant="outline">
                  {Math.round(Number(property.price) / Number(property.surface_area))} €/m²
                </Badge>
              )}
              <Badge variant="outline">Geplaatst {daysAgoLabel}</Badge>
              {(property.views_count ?? 0) > 0 && (
                <Badge variant="outline">{property.views_count}x bekeken</Badge>
              )}
            </div>
          </div>

          {/* Specs + price */}
          <div className="flex flex-col justify-between gap-4 md:w-[230px] md:shrink-0 md:border-l md:border-border/60 md:pl-6">
            <ul className="space-y-1.5 text-sm text-foreground">
              {property.surface_area && (
                <li className="flex items-center gap-2">
                  <Maximize className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{property.surface_area} m² woonoppervlak</span>
                </li>
              )}
              {property.bedrooms && (
                <li className="flex items-center gap-2">
                  <Bed className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{property.bedrooms} slaapkamers</span>
                </li>
              )}
              {property.bathrooms && (
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{property.bathrooms} badkamers</span>
                </li>
              )}
              {property.energy_label && (
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Energielabel {property.energy_label}</span>
                </li>
              )}
              {property.listing_type === "huur" && fitsBudget === true && Number(property.price) > 0 && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  <span>Past binnen jouw budget</span>
                </li>
              )}

            </ul>

            <div className="flex items-end justify-between gap-3 md:flex-col md:items-start">
              <div>
                <p className="font-display text-3xl font-extrabold leading-none tracking-tight text-primary">
                  {euro(Number(property.price))}
                </p>
                {property.listing_type === "huur" && (
                  <p className="mt-1 text-[11px] text-muted-foreground">per maand</p>
                )}
              </div>
              <span className="text-sm font-semibold text-accent underline underline-offset-4">Meer info</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PropertyCard;
