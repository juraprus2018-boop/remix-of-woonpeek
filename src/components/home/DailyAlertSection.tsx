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
  vakantiehuis: "Vakantiehuis",
};

const DailyAlertSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  const subscribe = useMutation({
    mutationFn: async (payload: {
      email?: string;
      city: string;
      property_type?: string;
      search_label?: string;
      turnstileToken?: string | null;
    }) => {
      const { data, error } = await supabase.functions.invoke("daily-alert-subscribe", {
        body: payload,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Gelukt",
        description: data?.message || "Je bent ingeschreven voor alerts.",
      });
      setEmail("");
      setCity("");
      setPropertyType("");
      setTurnstileToken(null);
    },
    onError: (error: unknown) => {
      toast({
        variant: "destructive",
        title: "Inschrijven mislukt",
        description: error instanceof Error ? error.message : "Probeer het later opnieuw.",
      });
    },
  });

  const handleSubmit = () => {
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
      search_label: propertyType
        ? `${PROPERTY_TYPE_LABELS[propertyType]} in ${city}`
        : undefined,
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
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1.3fr_auto] md:items-end">
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
                <option value="vakantiehuis">Vakantiehuis</option>
              </select>
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
