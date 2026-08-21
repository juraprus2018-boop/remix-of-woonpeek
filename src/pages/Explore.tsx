import { useState, useMemo, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import SEOHead from "@/components/seo/SEOHead";

import PropertyCard from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProperties, useMapProperties, useCityList, type SortOption } from "@/hooks/useProperties";
import { Loader2, MapPin, ChevronRight, SlidersHorizontal, X, Navigation, Map as MapIcon, List, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
const ExploreMap = lazy(() => import("@/components/explore/ExploreMap"));
import { useIsMobile } from "@/hooks/use-mobile";

type ListingType = "huur" | "koop";

const SOURCE_SITE_LABELS: Record<string, string> = {
  wooniezie: "Wooniezie",
  kamernet: "Kamernet",
  pararius: "Pararius",
  "huurwoningen.nl": "Huurwoningen.nl",
  directwonen: "DirectWonen",
  vesteda: "Vesteda",
};

const DISTANCE_OPTIONS = [5, 10, 15, 25, 50];
const LIST_PAGE_SIZE = 48;

// Haversine distance in km
const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  appartement: "Appartement",
  huis: "Huis",
  studio: "Studio",
  kamer: "Kamer",
};

const ExplorePage = () => {
  const [searchParams] = useSearchParams();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [listingType, setListingType] = useState<ListingType | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [minBedrooms, setMinBedrooms] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const isMobile = useIsMobile();


  // Postcode + distance state
  const [postcode, setPostcode] = useState("");
  const [debouncedPostcode, setDebouncedPostcode] = useState("");
  const [distanceKm, setDistanceKm] = useState(10);
  const [postcodeCoords, setPostcodeCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounce postcode input
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedPostcode(postcode.trim());
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [postcode]);

  // Geocode postcode via Nominatim
  useEffect(() => {
    if (!debouncedPostcode || debouncedPostcode.length < 4) {
      setPostcodeCoords(null);
      return;
    }
    let cancelled = false;
    setGeocoding(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(debouncedPostcode)}&country=Netherlands&format=json&limit=1`,
      { headers: { "Accept-Language": "nl" } }
    )
      .then((r) => r.json())
      .then((results) => {
        if (cancelled) return;
        if (results?.[0]) {
          setPostcodeCoords({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
          // Clear city filter when using postcode
          setSelectedCity(null);
        } else {
          setPostcodeCoords(null);
        }
      })
      .catch(() => {
        if (!cancelled) setPostcodeCoords(null);
      })
      .finally(() => {
        if (!cancelled) setGeocoding(false);
      });
    return () => { cancelled = true; };
  }, [debouncedPostcode]);

  // Geo coords passed via URL (?lat=&lng=&radius=)
  useEffect(() => {
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radius = parseInt(searchParams.get("radius") || "", 10);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setPostcodeCoords({ lat, lng });
      setSelectedCity(null);
      setPostcode("");
      if (Number.isFinite(radius) && DISTANCE_OPTIONS.includes(radius)) {
        setDistanceKm(radius);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Use paginated query for the list (fast initial load)
  const { data: listData, isLoading } = useProperties({
    listingType: listingType || undefined,
    sourceSite: selectedSource || undefined,
    city: selectedCity || undefined,
    propertyType: (propertyType as any) || undefined,
    minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
    sortBy,
    pageSize: 50,
  });

  // Separate lightweight query for map markers (only when map visible)
  // When a postcode filter is active we ALWAYS need the full set (not just the
  // first paginated page), otherwise the list shows fewer results than the map.
  const showMap = !isMobile || mobileView === "map" || !!postcodeCoords;
  const { data: mapData, isLoading: isMapLoading } = useMapProperties({
    listingType: listingType || undefined,
    sourceSite: selectedSource || undefined,
    city: selectedCity || undefined,
    propertyType: (propertyType as any) || undefined,
    minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
    sortBy,
  }, showMap);


  const paginatedList = listData?.properties || [];
  const totalCount = listData?.totalCount || 0;

  // When a postcode filter is active, base the list on the full mapData set so
  // the list and map stay in sync (otherwise the list only sees the first page
  // of paginated results and shows fewer matches than the map).
  const filteredProperties = useMemo(() => {
    if (!postcodeCoords) return paginatedList;
    const fullSet = (mapData || []) as any[];
    const nearby = fullSet.filter((p: any) => {
      if (!p.latitude || !p.longitude) return false;
      return (
        haversineKm(
          postcodeCoords.lat,
          postcodeCoords.lng,
          Number(p.latitude),
          Number(p.longitude),
        ) <= distanceKm
      );
    });
    if (sortBy === "price_asc") return [...nearby].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === "price_desc") return [...nearby].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return nearby;
  }, [paginatedList, mapData, postcodeCoords, distanceKm, sortBy]);

  // Map properties from the lightweight query
  const filteredMapProperties = useMemo(() => {
    const props = (mapData || []) as any[];
    if (!postcodeCoords) return props;
    return props.filter((p: any) => {
      if (!p.latitude || !p.longitude) return false;
      return haversineKm(postcodeCoords.lat, postcodeCoords.lng, Number(p.latitude), Number(p.longitude)) <= distanceKm;
    });
  }, [mapData, postcodeCoords, distanceKm]);

  const { data: cities = [] } = useCityList();

  // Live filtering van de plaatsenlijst op basis van de zoekbalk.
  const visibleCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(({ name }) => name.toLowerCase().includes(q));
  }, [cities, citySearch]);


  // Bron-counts berekenen vanuit de volledige mapData set zodat de aantallen
  // kloppen met de actieve filters (city/listingType/postcode).
  const activeSources = useMemo(() => {
    const counts = new Map<string, number>();
    const source = postcodeCoords ? filteredMapProperties : (mapData || []);
    for (const p of source as any[]) {
      const key = (p.source_site || "").toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Object.entries(SOURCE_SITE_LABELS).map(([value, label]) => ({
      value,
      label,
      count: counts.get(value) || 0,
    }));
  }, [mapData, filteredMapProperties, postcodeCoords]);

  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [listPage, setListPage] = useState(1);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const listScrollRef = useRef<HTMLDivElement>(null);

  const totalListPages = Math.max(1, Math.ceil(filteredProperties.length / LIST_PAGE_SIZE));
  const paginatedProperties = useMemo(() => {
    const from = (listPage - 1) * LIST_PAGE_SIZE;
    return filteredProperties.slice(from, from + LIST_PAGE_SIZE);
  }, [filteredProperties, listPage]);

  useEffect(() => {
    setListPage(1);
  }, [selectedCity, listingType, selectedSource, propertyType, minBedrooms, debouncedPostcode, distanceKm, sortBy]);


  useEffect(() => {
    if (listPage > totalListPages) setListPage(totalListPages);
  }, [listPage, totalListPages]);

  // Auto-collapse de kaart zodra de gebruiker door de lijst begint te scrollen.
  useEffect(() => {
    const el = listScrollRef.current;
    if (!el || isMobile) return;
    const onScroll = () => {
      if (el.scrollTop > 80) {
        setMapCollapsed(true);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const clearPostcode = useCallback(() => {
    setPostcode("");
    setDebouncedPostcode("");
    setPostcodeCoords(null);
  }, []);

  const sidebarContent = (
    <>
      <div className="p-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Verkennen</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Laden..." : `${totalCount} woningen`}
          </p>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator />

      <div className="p-5">
        <Label className="mb-2 block text-sm font-medium">Aanbod</Label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={listingType === "huur" ? "default" : "outline"}
            onClick={() => setListingType(listingType === "huur" ? null : "huur")}
            className="flex-1"
          >
            Te huur
          </Button>
          <Button
            size="sm"
            variant={listingType === "koop" ? "default" : "outline"}
            onClick={() => setListingType(listingType === "koop" ? null : "koop")}
            className="flex-1"
          >
            Te koop
          </Button>
        </div>
      </div>

      {/* Woningtype + kamers */}
      <Separator />
      <div className="grid grid-cols-2 gap-3 p-5">
        <div>
          <Label className="mb-2 block text-sm font-medium">Type</Label>
          <Select
            value={propertyType || "all"}
            onValueChange={(v) => setPropertyType(v === "all" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alle types" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              <SelectItem value="all">Alle types</SelectItem>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block text-sm font-medium">Kamers</Label>
          <Select
            value={minBedrooms || "all"}
            onValueChange={(v) => setMinBedrooms(v === "all" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="1">1+ kamer</SelectItem>
              <SelectItem value="2">2+ kamers</SelectItem>
              <SelectItem value="3">3+ kamers</SelectItem>
              <SelectItem value="4">4+ kamers</SelectItem>
              <SelectItem value="5">5+ kamers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>



      {/* Sortering */}
      <Separator />
      <div className="p-5">
        <Label className="mb-2 block text-sm font-medium">Sorteren op</Label>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder="Nieuwste eerst" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-popover">
            <SelectItem value="newest">Nieuwste eerst</SelectItem>
            <SelectItem value="price_asc">Prijs laag - hoog</SelectItem>
            <SelectItem value="price_desc">Prijs hoog - laag</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bron-filter direct na Aanbod, boven Postcode/Plaatsen */}
      <Separator />
      <div className="p-5">
        <Label className="mb-2 block text-sm font-medium">Bron</Label>
        <Select
          value={selectedSource || "all"}
          onValueChange={(v) => setSelectedSource(v === "all" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alle bronnen" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-popover">
            <SelectItem value="all">Alle bronnen</SelectItem>
            {activeSources.map(({ value, label, count }) => (
              <SelectItem key={value} value={value}>
                {label} ({count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Postcode + distance filter */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Postcode</Label>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="bijv. 1012AB"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="pl-10 pr-8"
            />
            {postcode && (
              <button
                onClick={clearPostcode}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {geocoding && <p className="text-xs text-muted-foreground">Zoeken...</p>}
          {debouncedPostcode && !geocoding && !postcodeCoords && debouncedPostcode.length >= 4 && (
            <p className="text-xs text-destructive">Postcode niet gevonden</p>
          )}
          {postcodeCoords && (
            <p className="text-xs text-primary">✓ Postcode gevonden</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Afstand: {postcodeCoords ? `${distanceKm} km` : "Vul postcode in"}
          </Label>
          <Slider
            value={[distanceKm]}
            onValueChange={([v]) => setDistanceKm(v)}
            max={50}
            min={1}
            step={1}
            disabled={!postcodeCoords}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {DISTANCE_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => postcodeCoords && setDistanceKm(d)}
                className={cn(
                  "rounded px-1.5 py-0.5 transition-colors",
                  postcodeCoords ? "hover:bg-muted cursor-pointer" : "opacity-50 cursor-not-allowed",
                  distanceKm === d && postcodeCoords && "bg-primary/10 text-primary font-medium"
                )}
              >
                {d}km
              </button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="p-5">
        <Label htmlFor="explore-city-search" className="mb-2 block text-sm font-medium">
          Plaatsen
        </Label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="explore-city-search"
            placeholder="Zoek een plaats..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            className="pl-10 pr-8"
          />
          {citySearch && (
            <button
              type="button"
              onClick={() => setCitySearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Zoekterm wissen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {selectedCity && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 w-full justify-start text-primary"
            onClick={() => setSelectedCity(null)}
          >
            ← Alle plaatsen
          </Button>
        )}
        <div className="space-y-1">
          {visibleCities.map(({ name, count }) => (

            <button
              key={name}
              onClick={() => {
                setSelectedCity(selectedCity === name ? null : name);
                if (name) clearPostcode(); // Clear postcode when selecting city
                if (isMobile) setSidebarOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                selectedCity === name
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {name}
              </span>
              <span className="flex items-center gap-1">
                <Badge variant="secondary" className={cn("text-xs", selectedCity === name && "bg-primary-foreground/20 text-primary-foreground")}>
                  {count}
                </Badge>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </span>
            </button>
          ))}
          {visibleCities.length === 0 && !isLoading && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {citySearch ? `Geen plaats gevonden voor "${citySearch}"` : "Geen plaatsen beschikbaar"}
            </p>
          )}

        </div>
      </div>
    </>
  );
  const renderPropertyList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredProperties.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold">Geen woningen gevonden</h3>
          <p className="text-muted-foreground">Pas je filters aan</p>
        </div>
      );
    }

    return (
      <>
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {((listPage - 1) * LIST_PAGE_SIZE) + 1}–{Math.min(listPage * LIST_PAGE_SIZE, filteredProperties.length)} van {filteredProperties.length}
          </span>
          <span>Pagina {listPage} / {totalListPages}</span>
        </div>

        <div className="flex flex-col gap-5">
          {paginatedProperties.map((property) => (
            <div
              key={property.id}
              onMouseEnter={() => setHoveredPropertyId(property.id)}
              onMouseLeave={() => setHoveredPropertyId(null)}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

        {totalListPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={listPage <= 1}
              onClick={() => setListPage((p) => p - 1)}
            >
              Vorige
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={listPage >= totalListPages}
              onClick={() => setListPage((p) => p + 1)}
            >
              Volgende
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Verken huur en koopwoningen op de kaart | Woonaanbod NL"
        description="Ontdek beschikbare huur en koopwoningen in heel Nederland op een interactieve kaart. Filter op stad, prijs en woningtype."
        canonical="/verkennen"
      />
      <Header />

      <main className="flex-1">
        <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
          {/* Mobile top bar */}
          {isMobile && (
            <div className="flex items-center justify-between border-b bg-card px-3 py-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSidebarOpen(true);
                  }}
                  className="gap-1.5 h-8 px-2.5"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </Button>
                <span className="text-xs text-muted-foreground">
                  {isLoading ? "Laden..." : `${filteredProperties.length} woningen`}
                </span>
              </div>
              {/* Mobile view toggle */}
              <div className="flex rounded-lg border overflow-hidden">
                <Button
                  variant={mobileView === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setMobileView("list")}
                  className="rounded-none h-8 px-3 gap-1.5"
                >
                  <List className="h-3.5 w-3.5" />
                  Lijst
                </Button>
                <Button
                  variant={mobileView === "map" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setMobileView("map")}
                  className="rounded-none h-8 px-3 gap-1.5"
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  Kaart
                </Button>
              </div>
            </div>
          )}

          {/* Mobile sidebar overlay */}
          {isMobile && sidebarOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <aside className="relative z-10 w-80 max-w-[85vw] overflow-y-auto bg-card shadow-xl">
                {sidebarContent}
              </aside>
            </div>
          )}

          {/* Desktop sidebar */}
          {!isMobile && (
            <aside className="w-80 shrink-0 overflow-y-auto border-r bg-card">
              {sidebarContent}
            </aside>
          )}

          {/* Content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Desktop: split map + list */}
            {!isMobile && (
              <>
                <div
                  className={cn(
                    "relative border-b transition-[height] duration-300 ease-in-out overflow-hidden",
                    mapCollapsed ? "h-0 min-h-0 border-b-0" : "h-1/2 min-h-[300px]"
                  )}
                >
                  {isMapLoading ? (
                    <div className="flex h-full items-center justify-center bg-muted/50">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Suspense fallback={<div className="flex h-full items-center justify-center bg-muted/50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                      <ExploreMap
                        properties={filteredMapProperties as any}
                        hoveredPropertyId={hoveredPropertyId}
                      />
                    </Suspense>
                  )}
                </div>
                <div ref={listScrollRef} className="relative flex-1 overflow-y-auto p-6">
                  {mapCollapsed && (
                    <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-4 flex justify-center border-b bg-card/95 px-6 py-2 backdrop-blur">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMapCollapsed(false);
                          listScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="gap-1.5"
                      >
                        <ChevronUp className="h-4 w-4" />
                        Bekijk de kaart
                      </Button>
                    </div>
                  )}
                  {renderPropertyList()}
                </div>
              </>
            )}

            {/* Mobile: tab-based full-screen view */}
            {isMobile && mobileView === "map" && (
              <div className="flex-1 relative">
                {isMapLoading ? (
                  <div className="flex h-full items-center justify-center bg-muted/50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Suspense fallback={<div className="flex h-full items-center justify-center bg-muted/50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <ExploreMap
                      properties={filteredMapProperties as any}
                      hoveredPropertyId={hoveredPropertyId}
                    />
                  </Suspense>
                )}
              </div>
            )}
            {isMobile && mobileView === "list" && (
              <div className="flex-1 overflow-y-auto p-3">
                {renderPropertyList()}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExplorePage;
