import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface PropertyQAProps {
  property: {
    id: string;
    title: string;
    description: string | null;
    city: string;
    street: string;
    house_number: string;
    postal_code: string;
    neighborhood: string | null;
    price: number;
    surface_area: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    energy_label: string | null;
    build_year: number | null;
    property_type: string;
    listing_type: string;
  };
}

const SUGGESTIONS = [
  "Is deze woning geschikt voor 2 personen?",
  "Wat zijn de geschatte energiekosten?",
  "Hoe is de buurt?",
  "Past dit binnen een budget van €3000 netto?",
];

/**
 * AI-powered Q&A widget over een woning. Houdt bezoekers langer op de pagina
 * en verbetert de kans op affiliate-conversie (energie/hypotheek). Roept de
 * edge function `property-qa` aan, die Lovable AI Gateway gebruikt.
 */
const PropertyQA = ({ property }: PropertyQAProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const { data, error } = await supabase.functions.invoke("property-qa", {
        body: { question: q, property },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAnswer((data as any)?.answer || "Geen antwoord ontvangen.");
    } catch (e: any) {
      const msg = e?.message || "Er ging iets mis";
      if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
        setError("Even rustig aan, te veel vragen tegelijk. Probeer over een minuut opnieuw.");
      } else if (msg.includes("402")) {
        setError("AI-tegoed op. Vraag de beheerder om bij te vullen.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-foreground">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-bold lowercase">vraag iets over deze woning</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Onze AI-assistent beantwoordt vragen op basis van wat we over deze woning weten.
        </p>

        {!answer && !loading && (
          <div className="mb-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setQuestion(s); ask(s); }}
                className="rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); ask(question); }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Bijv. is dit geschikt voor een gezin met hond?"
            rows={2}
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !question.trim()} className="sm:self-end">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Vraag</>}
          </Button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {answer && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{answer}</ReactMarkdown>
            <p className="mt-3 text-xs text-muted-foreground not-prose">
              AI-gegenereerd antwoord. Controleer altijd bij de aanbieder.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyQA;
