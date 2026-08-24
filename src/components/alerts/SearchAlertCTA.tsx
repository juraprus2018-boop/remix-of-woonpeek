import { useState } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SearchAlertFilters {
  city?: string | null;
  listingType?: string | null;
  propertyType?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRooms?: number | null;
}

interface SearchAlertCTAProps extends SearchAlertFilters {
  /** Human readable description of the search, used in the alert email. */
  label?: string;
  source?: string;
  className?: string;
  variant?: "card" | "inline";
}

const buildLabel = (f: SearchAlertFilters) => {
  const parts: string[] = [];
  parts.push(f.propertyType ? `${f.propertyType}s` : "woningen");
  if (f.listingType === "koop") parts.push("te koop");
  else if (f.listingType === "huur") parts.push("te huur");
  parts.push(`in ${f.city || "heel Nederland"}`);
  if (f.minRooms) parts.push(`vanaf ${f.minRooms} kamers`);
  if (f.maxPrice) parts.push(`tot € ${f.maxPrice.toLocaleString("nl-NL")}`);
  return parts.join(" ");
};

/**
 * One single alert product across the site: enter an e-mail address and get a
 * free notification as soon as a new property matches this exact search.
 */
const SearchAlertCTA = ({
  city,
  listingType,
  propertyType,
  minPrice,
  maxPrice,
  minRooms,
  label,
  source = "search",
  className = "",
  variant = "card",
}: SearchAlertCTAProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const searchLabel = label || buildLabel({ city, listingType, propertyType, minPrice, maxPrice, minRooms });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedEmail = email.trim().toLowerCase();
    if (!user && (!cleanedEmail || !emailRegex.test(cleanedEmail))) {
      toast({
        variant: "destructive",
        title: "Ongeldig e-mailadres",
        description: "Vul een geldig e-mailadres in.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-alert-subscribe", {
        body: {
          email: user ? undefined : cleanedEmail,
          city: city || "",
          listing_type: listingType || null,
          property_type: propertyType || null,
          min_price: minPrice || null,
          max_price: maxPrice || null,
          min_rooms: minRooms || null,
          search_label: searchLabel,
          source,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDone(true);
      setEmail("");
      toast({
        title: "Melding staat aan",
        description: data?.message || `Je ontvangt nieuw aanbod voor: ${searchLabel}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Instellen mislukt",
        description: err instanceof Error ? err.message : "Probeer het later opnieuw.",
      });
    } finally {
      setLoading(false);
    }
  };

  const wrapperClass =
    variant === "card"
      ? `rounded-2xl border border-border bg-card p-5 md:p-6 ${className}`
      : className;

  if (done) {
    return (
      <div className={wrapperClass}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">Je melding staat aan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Zodra er een nieuwe woning bijkomt voor {searchLabel}, krijg je een gratis e-mail.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <BellRing className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-foreground">
            Nieuwe woning gevonden? Ontvang direct een gratis melding.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Voor jouw zoekopdracht: {searchLabel}. Alleen je e-mailadres, geen account nodig.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!user && (
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="jouw@email.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sm:max-w-xs"
                aria-label="E-mailadres voor woningmelding"
              />
            )}
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Ontvang nieuw aanbod voor deze zoekopdracht
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Gratis en met één klik weer uit te zetten.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchAlertCTA;
