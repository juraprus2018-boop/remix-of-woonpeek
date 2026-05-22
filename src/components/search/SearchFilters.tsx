import { useEffect } from "react";
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

const propertyTypeLabels: Record<string, string> = {
  appartement: "Appartement",
  huis: "Huis",
  studio: "Studio",
  kamer: "Kamer",
};

const listingTypeLabels: Record<string, string> = {
  huur: "Te huur",
  koop: "Te koop",
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
            <Label className="text-xs">Locatie</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Stad of postcode"
                value={filters.city}
                onChange={(e) => update({ city: e.target.value })}
                className="h-10 pl-10"
              />
            </div>
          </div>
        )}

        {availablePropertyTypes.length > 1 && (
          <div className={fieldClass}>
            <Label className="text-xs">Type woning</Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value: PropertyType | "") => update({ propertyType: value })}
            >
              <SelectTrigger className="h-10"><SelectValue placeholder="Alle types" /></SelectTrigger>
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
            <Label className="text-xs">Aanbod</Label>
            <Select
              value={filters.listingType}
              onValueChange={(value: ListingType | "") => update({ listingType: value })}
            >
              <SelectTrigger className="h-10"><SelectValue placeholder="Koop & Huur" /></SelectTrigger>
              <SelectContent>
                {availableListingTypes.map((type) => (
                  <SelectItem key={type} value={type}>{listingTypeLabels[type]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className={fieldClass}>
          <Label className="text-xs">Max. prijs</Label>
          <Select
            value={filters.maxPrice ? String(filters.maxPrice) : ""}
            onValueChange={(value) => update({ maxPrice: value ? Number(value) : undefined })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Geen limiet" />
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
            <Label className="text-xs">Slaapkamers</Label>
            <Select
              value={filters.minBedrooms?.toString() || ""}
              onValueChange={(value) => update({ minBedrooms: value ? Number(value) : undefined })}
            >
              <SelectTrigger className="h-10"><SelectValue placeholder="Min." /></SelectTrigger>
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
            <Label className="text-xs">Oppervlakte</Label>
            <Select
              value={filters.minSurface?.toString() || ""}
              onValueChange={(value) => update({ minSurface: value ? Number(value) : undefined })}
            >
              <SelectTrigger className="h-10"><SelectValue placeholder="Min." /></SelectTrigger>
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
              Bruto inkomen
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="bv. 3500"
              className="h-10"
              value={filters.grossIncome ?? ""}
              onChange={(e) => update({ grossIncome: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        )}

        <Button variant="outline" onClick={onClear} className="h-10 shrink-0 gap-2">
          <X className="h-4 w-4" /> Wissen
        </Button>
      </div>
    );
  }

  // ============ VERTICAL (sidebar) LAYOUT ============
  return (
    <div className="space-y-6">
      {!hideLocation && (
        <div className="space-y-2">
          <Label>Locatie</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Stad of postcode"
              value={filters.city}
              onChange={(e) => update({ city: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {availablePropertyTypes.length > 1 && (
        <div className="space-y-2">
          <Label>Type woning</Label>
          <Select
            value={filters.propertyType}
            onValueChange={(value: PropertyType | "") => update({ propertyType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alle types" />
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
          <Label>Aanbod</Label>
          <Select
            value={filters.listingType}
            onValueChange={(value: ListingType | "") => update({ listingType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Koop & Huur" />
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
        <Label>Max. prijs: {filters.maxPrice ? `€${filters.maxPrice.toLocaleString("nl-NL")}` : "Geen limiet"}</Label>
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
            Inkomen-check (huur)
          </Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Bruto maandinkomen, bv. 3500"
            value={filters.grossIncome ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              update({ grossIncome: val });
            }}
          />
          {incomeBasedMaxRent && (
            <p className="text-xs text-muted-foreground">
              Toont alleen huur tot <strong>€{incomeBasedMaxRent.toLocaleString("nl-NL")}</strong> (inkomen ÷ 3).
            </p>
          )}
        </div>
      )}

      {availableBedrooms.length > 0 && (
        <div className="space-y-2">
          <Label>Min. slaapkamers</Label>
          <Select
            value={filters.minBedrooms?.toString() || ""}
            onValueChange={(value) => update({ minBedrooms: value ? Number(value) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Geen minimum" />
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
          <Label>Min. oppervlakte</Label>
          <Select
            value={filters.minSurface?.toString() || ""}
            onValueChange={(value) => update({ minSurface: value ? Number(value) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Geen minimum" />
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
        <Label htmlFor="include-inactive">Toon inactieve woningen</Label>
        <Switch
          id="include-inactive"
          checked={filters.includeInactive}
          onCheckedChange={(checked) => update({ includeInactive: checked })}
        />
      </div>

      <Button variant="outline" onClick={onClear} className="w-full">
        <X className="mr-2 h-4 w-4" />
        Filters wissen
      </Button>
    </div>
  );
};

export default SearchFilters;
