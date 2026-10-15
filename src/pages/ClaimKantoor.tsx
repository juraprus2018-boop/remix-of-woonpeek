import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Building2 } from "lucide-react";

const schema = z.object({
  office_name: z.string().trim().min(2, "Vul de kantoornaam in").max(150),
  city: z.string().trim().max(100).optional(),
  contact_name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  phone: z.string().trim().max(30).optional(),
  website: z.string().trim().max(255).optional(),
});

const ClaimKantoor = () => {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ office_name: params.get("kantoor") ?? "", city: params.get("plaats") ?? "", contact_name: "", email: "", phone: "", website: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast({ title: parsed.error.issues[0].message, variant: "destructive" }); return; }
    setSending(true);
    const clean = Object.fromEntries(Object.entries(parsed.data).map(([k, v]) => [k, v === "" ? null : v]));
    const { error } = await supabase.from("agency_claim_requests").insert(clean as any);
    setSending(false);
    if (error) { toast({ title: "Versturen mislukt, probeer opnieuw", variant: "destructive" }); return; }
    setDone(true);
  };

  const f = (k: keyof typeof form, label: string, type = "text") => (
    <label className="block text-sm font-medium">{label}
      <Input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-1" />
    </label>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead title="Claim je kantoorpagina gratis | Woonaanbod NL" description="Claim gratis de pagina van je makelaarskantoor op Woonaanbod NL en zet je volledige woningaanbod online." canonical="/makelaars/claim" />
      <Header />
      <main className="container flex-1 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Building2 className="h-10 w-10 text-accent" />
            <h1 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">Claim je kantoor gratis</h1>
            <p className="mt-3 text-muted-foreground">Woningzoekers zoeken elke dag op Woonaanbod NL. Claim je kantoorpagina, koppel je feed en je aanbod staat direct online. Gratis, zonder abonnement.</p>
            <ul className="mt-4 space-y-2 text-foreground">
              {["Eigen pagina met logo en actueel aanbod", "Koppeling via XML, JSON of Realworks-export", "Inzicht in vertoningen, kliks en reacties"].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />{t}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">Liever meteen zelf starten? <Link to="/makelaar-portal" className="text-accent underline">Ga naar het makelaarsportaal</Link>.</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            {done ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
                <p className="mt-3 font-display text-xl font-bold">Aanvraag ontvangen</p>
                <p className="mt-1 text-muted-foreground">We nemen contact op om je pagina te activeren.</p>
                <Button asChild className="mt-4"><Link to="/makelaar-portal">Direct zelf starten</Link></Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                {f("office_name", "Kantoornaam *")}
                {f("city", "Plaats")}
                {f("contact_name", "Contactpersoon")}
                {f("email", "E-mailadres *", "email")}
                {f("phone", "Telefoon", "tel")}
                {f("website", "Website")}
                <Button type="submit" size="lg" className="w-full" disabled={sending}>{sending ? "Versturen…" : "Claim mijn kantoor"}</Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClaimKantoor;
