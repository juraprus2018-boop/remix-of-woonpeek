import { useCallback, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BellRing, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import MunicipalityCitySelect from "@/components/search/MunicipalityCitySelect";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  appartement: "Appartement",
  huis: "Huis",
  studio: "Studio",
  kamer: "Kamer",
  vakantiehuis: "Vakantiehuis",
};

const DailyAlertSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const [city, setCity] = useState(params.get("plaats") || params.get("locatie") || "");
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPE_LABELS[params.get("type") || ""] ? params.get("type")! : "");
  const [listingType, setListingType] = useState(["huur", "koop"].includes(params.get("aanbod") || "") ? params.get("aanbod")! : "");
  const positiveNumber = (value: string | null) => value && Number.isFinite(Number(value)) && Number(value) > 0 ? String(Number(value)) : "";
  const [maxPrice, setMaxPrice] = useState(positiveNumber(params.get("max_prijs")));
  const [minRooms, setMinRooms] = useState(positiveNumber(params.get("min_kamers")));
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  const summary = [city || "Heel Nederland", listingType === "huur" ? "Huur" : listingType === "koop" ? "Koop" : "Huur en koop", PROPERTY_TYPE_LABELS[propertyType] || "Alle woningtypes", maxPrice ? `maximaal ${new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(maxPrice))}${listingType === "huur" ? " per maand" : ""}` : "Geen maximumprijs", minRooms ? `minimaal ${minRooms} kamers` : ""].filter(Boolean).join(" · ");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  const subscribe = useMutation({
    mutationFn: async (payload: {
      email?: string;
      city: string;
      property_type?: string;
      listing_type?: string;
      max_price?: number;
      min_rooms?: number;
      search_label?: string;
      turnstileToken?: string | null;
    }) => {
      const { data, error } = await supabase.functions.invoke("daily-alert-subscribe", {
        body: payload,
      });
      if (error) {
        const details = await error.context?.json?.().catch(() => null);
        throw new Error(details?.error || "Inschrijven lukt nu niet. Controleer je verbinding en probeer opnieuw.");
      }
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Gelukt",
        description: data?.message || "Je bent ingeschreven voor alerts.",
      });
      setFeedback({ error: false, message: data?.message || "Je inschrijving is gelukt. Je ontvangt maximaal één e-mail per dag als er passend nieuw aanbod is." });
      setEmail("");
      setTurnstileToken(null);
    },
    onError: (error: unknown) => {
      setFeedback({ error: true, message: error instanceof Error ? error.message : "Probeer het later opnieuw." });
      toast({
        variant: "destructive",
        title: "Inschrijven mislukt",
        description: error instanceof Error ? error.message : "Probeer het later opnieuw.",
      });
    },
  });

  const handleSubmit = () => {
    setFeedback(null);
    if ((maxPrice && (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) <= 0)) || (minRooms && (!Number.isInteger(Number(minRooms)) || Number(minRooms) <= 0))) {
      setFeedback({ error: true, message: "Vul een positieve maximumprijs en een geheel aantal kamers in, of laat deze velden leeg." });
      return;
    }
    if (!city) {
      toast({
        variant: "destructive",
        title: "Stad vereist",
        description: "Selecteer een stad waarvoor je alerts wilt ontvangen.",
      });
      return;
    }

    if (!user) {
      const cleanedEmail = email.trim().toLowerCase();
      if (!cleanedEmail || !emailRegex.test(cleanedEmail)) {
        toast({
          variant: "destructive",
          title: "Ongeldig e-mailadres",
          description: "Vul een geldig e-mailadres in.",
        });
        return;
      }
    }

    if (turnstileSiteKey && !turnstileToken) {
      toast({
        variant: "destructive",
        title: "Captcha vereist",
        description: "Vink de captcha aan voordat je je inschrijft.",
      });
      return;
    }

    subscribe.mutate({
      email: user ? undefined : email.trim().toLowerCase(),
      city,
      property_type: propertyType || undefined,
      listing_type: listingType || undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      min_rooms: minRooms ? Number(minRooms) : undefined,
      search_label: summary,
      turnstileToken,
    });
  };

  const handleTokenChange = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ city?: string }>).detail;
      if (detail?.city) setCity(detail.city);
    };
    window.addEventListener("woonaanbod-nl:prefill-alert", handler as EventListener);
    return () =>
      window.removeEventListener("woonaanbod-nl:prefill-alert", handler as EventListener);
  }, []);

  return (
    <section id="daily-alert" className="scroll-mt-24 bg-surface-cream py-8 md:py-10">
      <div className="container">
        <div className="mx-auto max-w-5xl rounded-2xl border-2 border-primary/20 bg-background p-5 shadow-md md:p-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Ontvang jouw gratis woonmelding</h2>
          <p className="mb-5 mt-2 text-muted-foreground">Maximaal één e-mail per dag, alleen bij nieuw aanbod dat past bij jouw criteria. Gratis en altijd opzegbaar.</p>
          <div className="grid gap-4 md:grid-cols-2 md:items-end">
            <MunicipalityCitySelect
              id="alert-city"
              value={city}
              onChange={setCity}
              hideHelper
            />

            <div>
              <label
                htmlFor="alert-property-type"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Woningtype
              </label>
              <select
                id="alert-property-type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Alle woningtypes</option>
                <option value="appartement">Appartement</option>
                <option value="huis">Huis</option>
                <option value="studio">Studio</option>
                <option value="kamer">Kamer</option>
                <option value="vakantiehuis">Vakantiehuis</option>
              </select>
            </div>

            <div>
              <label htmlFor="alert-listing-type" className="mb-1.5 block text-sm font-medium text-foreground">Aanbod</label>
              <select id="alert-listing-type" value={listingType} onChange={(e) => setListingType(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Huur en koop</option><option value="huur">Huur</option><option value="koop">Koop</option>
              </select>
            </div>
            <div>
              <label htmlFor="alert-max-price" className="mb-1.5 block text-sm font-medium text-foreground">Maximumprijs (€){listingType === "huur" ? " per maand" : ""}</label>
              <Input id="alert-max-price" type="number" min="1" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Geen maximum" />
            </div>
            <div>
              <label htmlFor="alert-min-rooms" className="mb-1.5 block text-sm font-medium text-foreground">Minimaal aantal kamers</label>
              <Input id="alert-min-rooms" type="number" min="1" step="1" value={minRooms} onChange={(e) => setMinRooms(e.target.value)} placeholder="Geen minimum" />
            </div>
            {!user ? (
              <div>
                <label
                  htmlFor="alert-email"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  E-mailadres *
                </label>
                <Input
                  id="alert-email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </div>
            ) : (
              <div>
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  E-mailadres
                </span>
                <div className="flex h-10 items-center truncate rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground">
                  {user.email}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground md:col-span-2" aria-live="polite">
              <p className="font-semibold">Jouw zoekopdracht</p><p className="mt-1">{summary}</p>
            </div>
            {feedback && <p role={feedback.error ? "alert" : "status"} className={`md:col-span-2 text-sm ${feedback.error ? "text-destructive" : "text-foreground"}`}>{feedback.message}</p>}
            <Button
              onClick={handleSubmit}
              disabled={subscribe.isPending}
              className="h-12 w-full gap-2 px-8 text-base md:w-auto"
            >
              {subscribe.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <BellRing className="h-5 w-5" />
              )}
              Gratis inschrijven
            </Button>
          </div>

          <div className="mt-4">
            <TurnstileWidget siteKey={turnstileSiteKey} onTokenChange={handleTokenChange} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyAlertSection;
