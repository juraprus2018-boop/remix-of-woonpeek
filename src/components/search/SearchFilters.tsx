import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MapPin, X, Wallet } from "lucide-react";
import { type FilterFacets } from "@/hooks/useProperties";
import { cn } from "@/lib/utils";

type PropertyType = "appartement" | "huis" | "studio" | "kamer";
type ListingType = "huur" | "koop";

export interface SearchFilterValues {
  city: string;
  propertyType: PropertyType | "";
  listingType: ListingType | "";
  maxPrice: number | undefined;
  minBedrooms: number | undefined;
  minSurface: number | undefined;
  includeInactive: boolean;
  grossIncome: number | undefined;
}

interface SearchFiltersProps {
  filters: SearchFilterValues;
  onChange: (filters: SearchFilterValues) => void;
  onClear: () => void;
  hideLocation?: boolean;
  facets?: FilterFacets | null;
  horizontal?: boolean;
}

const propertyTypeKeys: Record<string, string> = {
  appartement: "filters.typeApartment",
  huis: "filters.typeHouse",
  studio: "filters.typeStudio",
  kamer: "filters.typeRoom",
};

const listingTypeKeys: Record<string, string> = {
  huur: "filters.forRent",
  koop: "filters.forSale",
};

const priceOptions = [750, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000];

const SearchFilters = ({
  filters,
  onChange,
  onClear,
  hideLocation = false,
  facets,
  horizontal = false,
}: SearchFiltersProps) => {
  const { t } = useTranslation();
  const propertyTypeLabels: Record<string, string> = Object.fromEntries(
    Object.entries(propertyTypeKeys).map(([k, v]) => [k, t(v)])
  );
  const listingTypeLabels: Record<string, string> = Object.fromEntries(
    Object.entries(listingTypeKeys).map(([k, v]) => [k, t(v)])
  );
  const update = (patch: Partial<SearchFilterValues>) => {
    onChange({ ...filters, ...patch });
  };

  const propertyTypes: PropertyType[] = ["appartement", "huis", "studio", "kamer"];
  const listingTypes: ListingType[] = ["huur", "koop"];
  const bedroomOptions = [1, 2, 3, 4];
  const surfaceOptions = [25, 50, 75, 100];

  const availablePropertyTypes = facets ? propertyTypes.filter(t => (facets.propertyTypes[t] || 0) > 0) : propertyTypes;
  const availableListingTypes = facets ? listingTypes.filter(t => (facets.listingTypes[t] || 0) > 0) : listingTypes;
  const availableBedrooms = facets ? bedroomOptions.filter(n => (facets.bedroomCounts[String(n)] || 0) > 0) : bedroomOptions;
  const availableSurfaces = facets ? surfaceOptions.filter(n => (facets.surfaceRanges[String(n)] || 0) > 0) : surfaceOptions;
  const availablePrices = facets ? priceOptions.filter(p => (facets.priceOptions?.[String(p)] || 0) > 0) : priceOptions;

  // Auto-clear filter values that would yield 0 results
  useEffect(() => {
    if (!facets) return;
    const patch: Partial<SearchFilterValues> = {};
    if (filters.propertyType && !availablePropertyTypes.includes(filters.propertyType as PropertyType)) patch.propertyType = "";
    if (filters.listingType && !availableListingTypes.includes(filters.listingType as ListingType)) patch.listingType = "";
    if (filters.maxPrice && !availablePrices.includes(filters.maxPrice)) patch.maxPrice = undefined;
    if (filters.minBedrooms && !availableBedrooms.includes(filters.minBedrooms)) patch.minBedrooms = undefined;
    if (filters.minSurface && !availableSurfaces.includes(filters.minSurface)) patch.minSurface = undefined;
    if (Object.keys(patch).length > 0) onChange({ ...filters, ...patch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facets]);

  const showIncomeFilter = filters.listingType !== "koop";
  const incomeBasedMaxRent = filters.grossIncome ? Math.floor(filters.grossIncome / 3) : undefined;

  // ============ HORIZONTAL (1-regel) LAYOUT ============
  if (horizontal) {
    const fieldClass = "flex min-w-[140px] flex-1 flex-col gap-1 [&_label]:font-bold [&_label]:text-foreground";
    return (
      <div className="flex flex-wrap items-end gap-3">
        {!hideLocation && (
          <div className={fieldClass}>
            <Label className="text-xs">{t("filters.location")}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("filters.locationPlaceholder")}
                value={filters.city}
                onChange={(e) => update({ city: e.target.value })}
                className="h-10 pl-10"
              />
            </div>
          </div>
        )}

        {availablePropertyTypes.length > 1 && (
          <div className={fieldClass}>
            <Label className="text-xs">{t("filters.propertyType")}</Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value: PropertyType | "") => update({ propertyType: value })}
            >
              <SelectTrigger className="h-10"><SelectValue placeholder={t("filters.allTypes")} /></SelectTrigger>
              <SelectContent>
                {availablePropertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>{propertyTypeLabels[type]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {availableListingTypes.length > 1 && (
          <div className={fieldClass}>
            <Label className="text-xs">{t("filters.offer")}</Label>
            <Select
              value={filters.listingType}
              onValueChange={(value: ListingType | "") => update({ listingType: value })}
            >
              <SelectTrigger className="h-10"><SelectValue placeholder={t("filters.buyRent")} /></SelectTrigger>
              <SelectContent>
                {availableListingTypes.map((type) => (
                  <SelectItem key={type} value={type}>{listingTypeLabels[type]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className={fieldClass}>
          <Label className="text-xs">{t("filters.maxPrice")}</Label>
          <Select
            value={filters.maxPrice ? String(filters.maxPrice) : ""}
            onValueChange={(value) => update({ maxPrice: value ? Number(value) : undefined })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder={t("filters.noLimit")} />
            </SelectTrigger>
            <SelectContent>
              {availablePrices.map((p) => (
                <SelectItem key={p} value={String(p)}>€{p.toLocaleString("nl-NL")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {availableBedrooms.length > 0 && (
          <div className={fieldClass}>
            <Label className="text-xs">{t("filters.bedrooms")}</Label>
            <Select
              value={filters.minBedrooms?.toString() || ""}
              onValueChange={(value) => update({ minBedrooms: value ? Number(value) : undefined })}
            >
              <SelectTrigger className="h-10"><SelectValue placeholder={t("filters.minShort")} /></SelectTrigger>
              <SelectContent>
                {availableBedrooms.map((num) => (
                  <SelectItem key={num} value={String(num)}>{num}+</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {availableSurfaces.length > 0 && (
          <div className={fieldClass}>
            <Label className="text-xs">{t("filters.surface")}</Label>
            <Select
              value={filters.minSurface?.toString() || ""}
              onValueChange={(value) => update({ minSurface: value ? Number(value) : undefined })}
            >
              <SelectTrigger className="h-10"><SelectValue placeholder={t("filters.minShort")} /></SelectTrigger>
              <SelectContent>
                {availableSurfaces.map((num) => (
                  <SelectItem key={num} value={String(num)}>{num}+ m²</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showIncomeFilter && (
          <div className={fieldClass}>
            <Label className="flex items-center gap-1 text-xs">
              <Wallet className="h-3 w-3 text-primary" />
              {t("filters.income")}
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder={t("filters.incomePlaceholder")}
              className="h-10"
              value={filters.grossIncome ?? ""}
              onChange={(e) => update({ grossIncome: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        )}

        <Button variant="outline" onClick={onClear} className="h-10 shrink-0 gap-2">
          <X className="h-4 w-4" /> {t("filters.clear")}
        </Button>
      </div>
    );
  }

  // ============ VERTICAL (sidebar) LAYOUT ============
  return (
    <div className="space-y-6">
      {!hideLocation && (
        <div className="space-y-2">
          <Label>{t("filters.location")}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("filters.locationPlaceholder")}
              value={filters.city}
              onChange={(e) => update({ city: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {availablePropertyTypes.length > 1 && (
        <div className="space-y-2">
          <Label>{t("filters.propertyType")}</Label>
          <Select
            value={filters.propertyType}
            onValueChange={(value: PropertyType | "") => update({ propertyType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filters.allTypes")} />
            </SelectTrigger>
            <SelectContent>
              {availablePropertyTypes.map((type) => {
                const count = facets?.propertyTypes[type];
                return (
                  <SelectItem key={type} value={type}>
                    {propertyTypeLabels[type]}
                    {count !== undefined && (
                      <span className="ml-1 text-muted-foreground">({count.toLocaleString("nl-NL")})</span>
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {availableListingTypes.length > 1 && (
        <div className="space-y-2">
          <Label>{t("filters.offer")}</Label>
          <Select
            value={filters.listingType}
            onValueChange={(value: ListingType | "") => update({ listingType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filters.buyRent")} />
            </SelectTrigger>
            <SelectContent>
              {availableListingTypes.map((type) => {
                const count = facets?.listingTypes[type];
                return (
                  <SelectItem key={type} value={type}>
                    {listingTypeLabels[type]}
                    {count !== undefined && (
                      <span className="ml-1 text-muted-foreground">({count.toLocaleString("nl-NL")})</span>
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t("filters.maxPrice")}: {filters.maxPrice ? `€${filters.maxPrice.toLocaleString("nl-NL")}` : t("filters.noLimit")}</Label>
        <Slider
          value={[filters.maxPrice || 5000]}
          onValueChange={([value]) => update({ maxPrice: value })}
          max={5000}
          min={200}
          step={50}
        />
      </div>

      {showIncomeFilter && (
        <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Label className="flex items-center gap-1.5 text-sm">
            <Wallet className="h-4 w-4 text-primary" />
            {t("filters.incomeCheck")}
          </Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t("filters.incomeCheckPlaceholder")}
            value={filters.grossIncome ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              update({ grossIncome: val });
            }}
          />
          {incomeBasedMaxRent && (
            <p className="text-xs text-muted-foreground">
              {t("filters.incomeHint")} <strong>€{incomeBasedMaxRent.toLocaleString("nl-NL")}</strong> {t("filters.incomeHintSuffix")}.
            </p>
          )}
        </div>
      )}

      {availableBedrooms.length > 0 && (
        <div className="space-y-2">
          <Label>{t("filters.minBedrooms")}</Label>
          <Select
            value={filters.minBedrooms?.toString() || ""}
            onValueChange={(value) => update({ minBedrooms: value ? Number(value) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filters.noMinimum")} />
            </SelectTrigger>
            <SelectContent>
              {availableBedrooms.map((num) => {
                const count = facets?.bedroomCounts[String(num)];
                return (
                  <SelectItem key={num} value={String(num)}>
                    {num}+
                    {count !== undefined && (
                      <span className="ml-1 text-muted-foreground">({count.toLocaleString("nl-NL")})</span>
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {availableSurfaces.length > 0 && (
        <div className="space-y-2">
          <Label>{t("filters.minSurface")}</Label>
          <Select
            value={filters.minSurface?.toString() || ""}
            onValueChange={(value) => update({ minSurface: value ? Number(value) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filters.noMinimum")} />
            </SelectTrigger>
            <SelectContent>
              {availableSurfaces.map((num) => {
                const count = facets?.surfaceRanges[String(num)];
                return (
                  <SelectItem key={num} value={String(num)}>
                    {num}+ m²
                    {count !== undefined && (
                      <span className="ml-1 text-muted-foreground">({count.toLocaleString("nl-NL")})</span>
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="include-inactive">{t("filters.showInactive")}</Label>
        <Switch
          id="include-inactive"
          checked={filters.includeInactive}
          onCheckedChange={(checked) => update({ includeInactive: checked })}
        />
      </div>

      <Button variant="outline" onClick={onClear} className="w-full">
        <X className="mr-2 h-4 w-4" />
        {t("filters.clearFilters")}
      </Button>
    </div>
  );
};

export default SearchFilters;
