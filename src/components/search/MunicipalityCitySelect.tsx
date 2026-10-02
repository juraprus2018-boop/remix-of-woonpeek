import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, MapPin, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DUTCH_CITIES } from "@/lib/dutchCities";
import { MUNICIPALITY_KERNEN } from "@/lib/municipalities";
import { supabase } from "@/integrations/supabase/client";
import { citySlug } from "@/lib/citySlug";
import { cn } from "@/lib/utils";

interface MunicipalityCitySelectProps {
  /** Geselecteerde plaatsnaam (kern of enkelvoudige gemeente). */
  value: string;
  /** Wordt aangeroepen met de definitieve plaatsnaam. */
  onChange: (city: string) => void;
  /** Optioneel ID voor labels (bijv. voor a11y). */
  id?: string;
  /** Extra className voor de wrapper. */
  className?: string;
}

interface PlaceOption {
  name: string;
  /** Optionele onderliggende gemeente (voor kernen). */
  municipality?: string;
}

/** Zoek normaliseren: lowercase, accenten eruit (Sneek/Burgum/Fryslân e.d.). */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, "");

const MAX_RESULTS = 60;

/**
 * Zoekveld met autocomplete: typ om direct te zoeken in alle gemeentes én
 * kernen (dorpen). Klik of Enter selecteert. Vervangt de oude twee-staps
 * dropdown, die bij honderden gemeentes onbruikbaar traag was.
 */
const MunicipalityCitySelect = ({
  value,
  onChange,
  id,
  className,
}: MunicipalityCitySelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Auto-toegevoegde plaatsen uit de DB (extra_cities) worden mee gemerged
  // zodat kernen die de sync-job ontdekt direct beschikbaar zijn.
  const { data: extraCities } = useQuery({
    queryKey: ["extra-cities-visible"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extra_cities")
        .select("name")
        .eq("is_visible", true);
      if (error) throw error;
      return (data ?? []).map((r) => r.name as string);
    },
    staleTime: 5 * 60_000,
  });

  // Alle kiesbare opties: gemeentes eerst, daarna kernen van samengestelde
  // gemeentes. Dedupliceer op canonical slug zodat varianten als
  // "'s-Heerenberg" / "s-Heerenberg" niet dubbel verschijnen.
  const options = useMemo<PlaceOption[]>(() => {
    const bySlug = new Map<string, PlaceOption>();
    const add = (name: string, municipality?: string) => {
      const key = citySlug(name);
      if (!key || bySlug.has(key)) return;
      bySlug.set(key, { name, municipality });
    };

    DUTCH_CITIES.forEach((c) => add(c));
    Object.keys(MUNICIPALITY_KERNEN).forEach((m) => add(m));
    (extraCities ?? []).forEach((c) => add(c));
    Object.entries(MUNICIPALITY_KERNEN).forEach(([muni, kernen]) => {
      kernen.forEach((k) => add(k, muni));
    });

    return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name, "nl"));
  }, [extraCities]);

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return options.slice(0, MAX_RESULTS);

    const starts: PlaceOption[] = [];
    const includes: PlaceOption[] = [];
    for (const opt of options) {
      const n = normalize(opt.name);
      const m = opt.municipality ? normalize(opt.municipality) : "";
      if (n.startsWith(q)) {
        starts.push(opt);
      } else if (n.includes(q) || m.includes(q)) {
        includes.push(opt);
      }
      if (starts.length + includes.length >= MAX_RESULTS * 2) break;
    }
    return [...starts, ...includes].slice(0, MAX_RESULTS);
  }, [options, search]);

  // Sync wanneer `value` extern verandert (bijv. reset of prefill).
  useEffect(() => {
    if (value) setSearch("");
  }, [value]);

  const select = (option: PlaceOption) => {
    onChange(option.name);
    setOpen(false);
    setSearch("");
    triggerRef.current?.focus();
  };

  const clear = () => {
    onChange("");
    setSearch("");
  };

  return (
    <div className={className}>
      <label
        htmlFor={id ? `${id}-place` : undefined}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        <MapPin className="mr-1 inline-block h-4 w-4" />
        Plaats of gemeente
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex gap-2">
          <PopoverTrigger asChild>
            <button
              ref={triggerRef}
              id={id ? `${id}-place` : undefined}
              type="button"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "flex h-10 flex-1 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm ring-offset-background transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {value || "Zoek je stad of dorp (bijv. Eindhoven)"}
                </span>
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          {value && (
            <button
              type="button"
              aria-label="Keuze wissen"
              onClick={clear}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
          onOpenAutoFocus={(e) => {
            // Focus blijft op de trigger-gebruik; cmdk-input krijgt focus via autofocus.
            e.preventDefault();
          }}
        >
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder="Typ een plaats of gemeente..."
                className="h-11 border-0 bg-transparent focus:ring-0"
                autoFocus
              />
            </div>
            <CommandList>
              <CommandEmpty>Geen plaats gevonden. Probeer een andere spelling.</CommandEmpty>
              <CommandGroup>
                {filtered.map((opt) => {
                  const selected = value === opt.name;
                  return (
                    <CommandItem
                      key={`${opt.municipality ?? ""}-${opt.name}`}
                      value={opt.name}
                      onSelect={() => select(opt)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4 shrink-0", selected ? "opacity-100" : "opacity-0")}
                      />
                      <span className="truncate">
                        {opt.name}
                        {opt.municipality && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            · gemeente {opt.municipality}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Typ de naam van je stad of dorp. Je ontvangt alleen meldingen voor deze plaats.
      </p>
    </div>
  );
};

export default MunicipalityCitySelect;
