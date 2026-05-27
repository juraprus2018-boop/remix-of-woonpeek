import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Shield, Upload, XCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type Severity = "high" | "medium" | "low" | "info";
interface Finding {
  severity: Severity;
  title: string;
  description: string;
  law?: string;
}
interface AnalysisResult {
  score: number;
  scoreLabel: string;
  summary: string;
  findings: Finding[];
  recommendations: string[];
}

const severityConfig: Record<Severity, { color: string; icon: typeof AlertTriangle; label: string }> = {
  high: { color: "text-destructive bg-destructive/10 border-destructive/30", icon: XCircle, label: "Hoog risico" },
  medium: { color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900", icon: AlertTriangle, label: "Aandacht" },
  low: { color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900", icon: Info, label: "Let op" },
  info: { color: "text-muted-foreground bg-muted border-border", icon: Info, label: "Info" },
};

export default function ContractCheck() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [email, setEmail] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Bestand te groot (max 10MB)");
      return;
    }
    setFileName(file.name);
    setParsing(true);
    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        let full = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          full += content.items.map((it: any) => it.str).join(" ") + "\n";
        }
        setText(full.trim());
      } else {
        const t = await file.text();
        setText(t);
      }
    } catch (err) {
      console.error(err);
      toast.error("Kon bestand niet lezen. Plak de tekst handmatig.");
    } finally {
      setParsing(false);
    }
  };

  const analyze = async () => {
    if (text.trim().length < 100) {
      toast.error("Plak minimaal 100 tekens uit je contract");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-contract", {
        body: { text },
      });
      if (error) throw error;
      if ((data as any).error) {
        toast.error((data as any).error);
        return;
      }
      setResult(data as AnalysisResult);
      // Optional: capture email for alerts
      if (email && email.includes("@")) {
        await supabase.from("daily_alert_subscribers").upsert(
          { email, source: "contract-check", is_active: true },
          { onConflict: "email" }
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Analyse mislukt");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.score >= 75
      ? "text-emerald-600"
      : result.score >= 50
      ? "text-amber-600"
      : "text-destructive"
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Huurcontract checken — gratis AI-analyse | Huurbaasje</title>
        <meta
          name="description"
          content="Laat je huurcontract gratis controleren met AI. Ontdek verboden bedingen, onredelijke bepalingen en weet binnen 30 seconden of je contract klopt."
        />
        <link rel="canonical" href="https://www.huurbaasje.nl/contract-check" />
      </Helmet>
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <Breadcrumbs items={[{ label: "Huurcontract checken" }]} />
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                <Shield className="h-3.5 w-3.5" />
                Gratis · AI-gestuurd · 30 seconden
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 lowercase">
                huurcontract checken
              </h1>
              <p className="text-lg text-muted-foreground">
                Upload of plak je huurcontract en krijg direct een risico-analyse volgens Nederlands huurrecht. Zonder registratie.
              </p>
            </div>

            {!result && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    1. Upload contract of plak tekst
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">{fileName || "Klik om PDF of tekstbestand te uploaden"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 10MB · PDF, TXT, DOCX</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                  </div>
                  {parsing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Bestand lezen...
                    </div>
                  )}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">of plak</span></div>
                  </div>
                  <Textarea
                    placeholder="Plak hier de tekst van je huurcontract..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    maxLength={50000}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{text.length.toLocaleString("nl-NL")} / 50.000 tekens</span>
                    {text.length >= 100 && <span className="text-emerald-600">✓ Klaar voor analyse</span>}
                  </div>

                  <div className="pt-2">
                    <Label htmlFor="email" className="text-sm">E-mail (optioneel — krijg gratis huuralerts)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jij@email.nl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={255}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={analyze}
                    disabled={loading || parsing || text.length < 100}
                    size="lg"
                    className="w-full"
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyseren...</>
                    ) : (
                      <><Shield className="h-4 w-4 mr-2" /> Analyseer mijn contract gratis</>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    🔒 Je contract wordt niet opgeslagen. Geen juridisch advies.
                  </p>
                </CardContent>
              </Card>
            )}

            {result && (
              <div className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl">Jouw contract-score</CardTitle>
                        <p className="text-muted-foreground mt-2">{result.summary}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-5xl font-bold ${scoreColor}`}>{result.score}</div>
                        <div className="text-xs text-muted-foreground">/ 100</div>
                        <Badge variant="outline" className="mt-1">{result.scoreLabel}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {result.findings?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Bevindingen ({result.findings.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.findings.map((f, i) => {
                        const cfg = severityConfig[f.severity] || severityConfig.info;
                        const Icon = cfg.icon;
                        return (
                          <div key={i} className={`border rounded-lg p-4 ${cfg.color}`}>
                            <div className="flex items-start gap-3">
                              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold">{f.title}</span>
                                  <Badge variant="secondary" className="text-xs">{cfg.label}</Badge>
                                </div>
                                <p className="text-sm mt-1 text-foreground/80">{f.description}</p>
                                {f.law && <p className="text-xs mt-2 italic opacity-75">📖 {f.law}</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {result.recommendations?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Aanbevolen acties
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((r, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-primary">→</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Deze analyse is geïndiceerd en geen juridisch advies. Bij twijfel: neem contact op met het <a className="underline" href="https://www.juridischloket.nl" target="_blank" rel="noopener noreferrer nofollow">Juridisch Loket</a> of de <a className="underline" href="https://huurcommissie.nl" target="_blank" rel="noopener noreferrer nofollow">Huurcommissie</a>.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setResult(null); setText(""); setFileName(""); }} className="flex-1">
                    Nieuw contract checken
                  </Button>
                  <Button asChild className="flex-1">
                    <a href="/vinden">Bekijk woningen</a>
                  </Button>
                </div>
              </div>
            )}

            <section className="mt-16 prose prose-sm max-w-none dark:prose-invert">
              <h2>Waarom je huurcontract checken?</h2>
              <p>
                In Nederland staan in veel huurcontracten <strong>onredelijke of zelfs verboden bepalingen</strong>. Denk aan torenhoge boetes, dubbele courtage, verboden bemiddelingskosten of een borg van meer dan twee maanden huur. Onze AI-checker scant je contract in seconden op de meest voorkomende risico's volgens de <strong>Wet goed verhuurderschap</strong> en de <strong>Wet betaalbare huur</strong>.
              </p>
              <h2>Wat checken we?</h2>
              <ul>
                <li>Borg (maximaal 2 maanden kale huur)</li>
                <li>Opzegtermijn huurder (1 maand) en verhuurder (3-6 maanden)</li>
                <li>Verboden bemiddelingskosten en dubbele courtage</li>
                <li>Servicekosten en transparantie</li>
                <li>Huurprijs vs puntenstelsel (WWS)</li>
                <li>Indexering en jaarlijkse huurverhoging</li>
                <li>Onderhoudsverdeling (klein vs groot)</li>
                <li>Onredelijke boetebedingen</li>
              </ul>
              <h2>Is dit juridisch advies?</h2>
              <p>
                Nee. Deze tool geeft een geïndiceerde risico-analyse op basis van Nederlands huurrecht. Voor bindend advies kun je terecht bij het Juridisch Loket of de Huurcommissie.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
