import { Link } from "react-router-dom";
import { Bed, Maximize, Users, MapPin, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import propertyPlaceholder from "@/assets/property-placeholder.jpg";
import { optimizeImage, buildSrcSet } from "@/lib/imageOptimization";
import { getStockPropertyImage } from "@/lib/stockImages";
import { cn } from "@/lib/utils";

type Property = Database["public"]["Tables"]["properties"]["Row"];

interface PropertyRowCardProps {
  property: Property;
  priority?: boolean;
}

const formatPrice = (price: number, listingType: string) => {
  const formatted = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return listingType === "huur" ? `${formatted} p/m` : formatted;
};

const PropertyRowCard = ({ property, priority = false }: PropertyRowCardProps) => {
  const heroSrc = property.images?.[0] ?? getStockPropertyImage(property.id);
  const hasOwn = !!property.images?.[0];

  const subtitle = [
    property.property_type,
    property.bedrooms ? `${property.bedrooms} kamers` : null,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <Link
      to={`/aanbod/${property.slug || property.id}`}
      className="group block"
      aria-label={property.title}
    >
      <article
        className={cn(
          "relative flex flex-col gap-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-lg sm:flex-row",
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
          {property.status !== "actief" && (
            <Badge variant="destructive" className="absolute left-3 top-3 text-xs capitalize">
              {property.status}
            </Badge>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 p-5 md:flex-row md:gap-6">
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold leading-snug text-foreground line-clamp-2">
              {property.title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-sm font-semibold capitalize text-accent">{subtitle}</p>
            )}
            {property.description && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                {property.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">
                {property.street} {property.house_number}, {property.city}
              </span>
            </div>

            {/* Extra info chips */}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <Badge variant="secondary" className="capitalize">{property.property_type}</Badge>
              {property.postal_code && (
                <Badge variant="outline">{property.postal_code}</Badge>
              )}
              {property.neighborhood && (
                <Badge variant="outline" className="capitalize">{property.neighborhood}</Badge>
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

          {/* Specs */}
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
              {property.listing_type === "huur" && Number(property.price) > 0 && (
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    Inkomen vanaf{" "}
                    {new Intl.NumberFormat("nl-NL", {
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Number(property.price) * 3)}
                  </span>
                </li>
              )}
            </ul>

            <div className="flex items-end justify-between gap-3 md:flex-col md:items-start">
              <div>
                <p className="font-display text-3xl font-extrabold leading-none tracking-tight text-primary">
                  {formatPrice(Number(property.price), property.listing_type)}
                </p>
                {property.listing_type === "huur" && (
                  <p className="mt-1 text-[11px] text-muted-foreground">per maand</p>
                )}
              </div>
              <span className="text-sm font-semibold text-accent underline underline-offset-4">
                Meer info
              </span>
            </div>
          </div>
        </div>
        </div>
      </article>
    </Link>
  );
};

export default PropertyRowCard;
