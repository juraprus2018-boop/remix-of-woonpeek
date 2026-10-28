import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StockBanner from "@/components/layout/StockBanner";

import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, PartyPopper, Check, Zap } from "lucide-react";

const AlertUnsubscribe = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Je afmelding wordt verwerkt...");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setMessage("Ongeldige afmeldlink.");
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("daily-alert-unsubscribe", {
        body: { token },
      });

      if (error || data?.error) {
        setMessage(data?.error || error?.message || "Afmelden is niet gelukt.");
        setIsSuccess(false);
      } else if (data?.already_unsubscribed) {
        setMessage("Je was al afgemeld voor deze alerts.");
        setIsSuccess(true);
      } else if (data?.success) {
        setMessage("Je bent succesvol afgemeld van de woningmeldingen.");
        setIsSuccess(true);
      } else {
        setMessage("Ongeldige of verlopen afmeldlink.");
        setIsSuccess(false);
      }

      setLoading(false);
    };

    run();
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Alert afmelden | Woonaanbod NL"
        description="Meld je af voor de gratis woningmeldingen van Woonaanbod NL."
        canonical="/radarmeldingen/uit"
      />
      <Header />
      <main className="flex-1">
        <StockBanner
          seed="alert-afmelden"
          eyebrow="Alerts"
          title={isSuccess ? "Afmelding voltooid" : "Afmelding"}
          subtitle="Beheer je e-mailvoorkeuren voor Woonaanbod NL alerts."
        />
        <div className="flex items-center justify-center p-4 py-12">
          <Card className="w-full max-w-lg">
            <CardContent className="space-y-4 p-8 text-center">
              {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /> : null}
              <p className="text-muted-foreground">{message}</p>
              <Link to="/">
                <Button variant="outline">Naar home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        {isSuccess && (
          <div className="container pb-12">
            <Card className="border-accent/40 bg-accent/5">
              <CardContent className="space-y-4 p-6 md:p-8">
                <div className="flex items-center gap-2 text-accent">
                  <PartyPopper className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Woning gevonden?</span>
                </div>
                <h2 className="text-2xl font-bold">Gefeliciteerd met je nieuwe woning!</h2>
                <p className="text-muted-foreground">
                  Regel je energie vóór de sleuteloverdracht. Zo zit je niet zonder stroom en betaal je geen duur standaardtarief.
                  Overstappen is gratis en de nieuwe leverancier regelt alles.
                </p>
                <ul className="grid gap-2 text-sm sm:grid-cols-3">
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-accent" />Stroom en gas regelen</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-accent" />Meterstanden noteren bij oplevering</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-accent" />Internet op tijd aanvragen</li>
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to="/energie"><Zap className="h-4 w-4" />Vergelijk energie voor je nieuwe adres</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/verhuischecklist">Bekijk de verhuischecklist</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AlertUnsubscribe;
