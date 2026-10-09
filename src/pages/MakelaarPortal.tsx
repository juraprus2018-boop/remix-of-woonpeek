import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { propertyUrl } from "@/lib/propertyUrl";
import { Eye, MousePointerClick, MessageSquare, Home, RefreshCw, Plus, ExternalLink, Loader2 } from "lucide-react";
import { FEED_TYPES, agencySlug, fetchMyAgency, type Agency, type FeedType } from "@/lib/agency";

type ProfileForm = { name: string; city: string; website: string; phone: string; email: string; description: string; logo_url: string };
const emptyProfile: ProfileForm = { name: "", city: "", website: "", phone: "", email: "", description: "", logo_url: "" };

/* ── Profiel-formulier (gebruikt in wizard én dashboard) ── */
const ProfileFields = ({ value, onChange, userId }: { value: ProfileForm; onChange: (v: ProfileForm) => void; userId: string }) => {
  const [uploading, setUploading] = useState(false);
  const set = (k: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [k]: e.target.value });
  const upload = async (file: File) => {
    if (file.size > 2_000_000) return toast({ variant: "destructive", title: "Logo te groot", description: "Maximaal 2 MB." });
    setUploading(true);
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `agencies/${userId}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("property-images").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) return toast({ variant: "destructive", title: "Upload mislukt", description: error.message });
    onChange({ ...value, logo_url: supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl });
  };
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div><Label htmlFor="a-name">Kantoornaam *</Label><Input id="a-name" value={value.name} onChange={set("name")} maxLength={120} /></div>
      <div><Label htmlFor="a-city">Plaats *</Label><Input id="a-city" value={value.city} onChange={set("city")} maxLength={80} /></div>
      <div><Label htmlFor="a-web">Website</Label><Input id="a-web" value={value.website} onChange={set("website")} placeholder="https://" maxLength={300} /></div>
      <div><Label htmlFor="a-phone">Telefoon</Label><Input id="a-phone" value={value.phone} onChange={set("phone")} maxLength={30} /></div>
      <div><Label htmlFor="a-email">E-mail voor woningzoekers</Label><Input id="a-email" type="email" value={value.email} onChange={set("email")} maxLength={200} /></div>
      <div>
        <Label htmlFor="a-logo">Logo</Label>
        <div className="flex items-center gap-3">
          {value.logo_url && <img src={value.logo_url} alt="" className="h-10 w-10 rounded border object-contain" />}
          <Input id="a-logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
      </div>
      <div className="md:col-span-2"><Label htmlFor="a-desc">Omschrijving</Label><Textarea id="a-desc" rows={5} value={value.description} onChange={set("description")} maxLength={2000} placeholder="Vertel woningzoekers wie je bent en waar je in gespecialiseerd bent." /></div>
    </div>
  );
};

/* ── Feed-formulier met test ── */
const FeedFields = ({ feedType, feedUrl, onChange }: { feedType: FeedType; feedUrl: string; onChange: (t: FeedType, u: string) => void }) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ found: number; valid: number; samples: Array<{ title?: string; city?: string; price?: number; images: number }> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const test = async () => {
    setTesting(true); setError(null); setResult(null);
    const { data, error } = await supabase.functions.invoke("agency-feed-import", { body: { mode: "test", feed_type: feedType, feed_url: feedUrl } });
    setTesting(false);
    if (error || data?.error) {
      let msg = data?.error || error?.message;
      try { const ctx = (error as { context?: Response })?.context; if (ctx) msg = (await ctx.json()).error || msg; } catch { /* noop */ }
      return setError(msg || "Feed testen mislukt");
    }
    setResult(data);
  };
  return (
    <div className="space-y-4">
      <RadioGroup value={feedType} onValueChange={(v) => { onChange(v as FeedType, feedUrl); setResult(null); }} className="grid gap-3 sm:grid-cols-2">
        {FEED_TYPES.map((f) => (
          <label key={f.value} className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${feedType === f.value ? "border-primary bg-primary/5" : "bg-card"}`}>
            <RadioGroupItem value={f.value} className="mt-1" />
            <div><div className="font-medium text-foreground">{f.label}</div><div className="text-sm text-muted-foreground">{f.help}</div></div>
          </label>
        ))}
      </RadioGroup>
      {feedType !== "handmatig" && (
        <div className="space-y-2">
          <Label htmlFor="feed-url">Feed-URL</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="feed-url" value={feedUrl} onChange={(e) => { onChange(feedType, e.target.value); setResult(null); }} placeholder="https://..." maxLength={1000} />
            <Button type="button" variant="outline" onClick={test} disabled={testing || !/^https?:\/\//.test(feedUrl)} className="gap-2">
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Test feed
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {result && (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-foreground">{result.valid} van {result.found} woningen herkend (met plaats en prijs).</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {result.samples.map((s, i) => <li key={i}>{s.title || "Woning"}, {s.city}, €{s.price} · {s.images} foto's</li>)}
              </ul>
              {result.valid === 0 && <p className="mt-2 text-destructive">Geen bruikbare woningen gevonden. Controleer of de link klopt of neem contact op.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Onboarding-wizard ── */
const Onboarding = ({ userId, defaultEmail, onDone }: { userId: string; defaultEmail: string; onDone: () => void }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileForm>({ ...emptyProfile, email: defaultEmail });
  const [feedType, setFeedType] = useState<FeedType>("xml");
  const [feedUrl, setFeedUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const base = agencySlug(profile.name, profile.city) || "makelaar";
    let slug = base;
    for (let i = 2; i < 20; i++) {
      const { data } = await supabase.from("agencies").select("id").eq("slug", slug).maybeSingle();
      if (!data) break;
      slug = `${base}-${i}`;
    }
    const { error } = await supabase.from("agencies").insert({
      owner_user_id: userId, slug, name: profile.name.trim(), city: profile.city.trim() || null,
      website: profile.website.trim() || null, phone: profile.phone.trim() || null, email: profile.email.trim() || null,
      description: profile.description.trim() || null, logo_url: profile.logo_url || null,
      feed_type: feedType, feed_url: feedType === "handmatig" ? null : feedUrl.trim() || null,
    });
    if (error) { setSaving(false); return toast({ variant: "destructive", title: "Opslaan mislukt", description: error.message }); }
    supabase.functions.invoke("send-agency-welcome").catch(() => {});
    if (feedType !== "handmatig" && feedUrl) {
      toast({ title: "Profiel aangemaakt", description: "We halen je aanbod nu op. Dit kan een minuut duren." });
      await supabase.functions.invoke("agency-feed-import", { body: { mode: "sync" } });
    }
    setSaving(false);
    onDone();
  };

  return (
    <div className="mx-auto w-full rounded-lg border bg-card p-6 md:p-8">
      <div className="mb-6 flex gap-2 text-sm">
        {["Bedrijfsprofiel", "Feed koppelen", "Klaar"].map((l, i) => (
          <span key={l} className={`rounded-full px-3 py-1 ${step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}. {l}</span>
        ))}
      </div>
      {step === 1 && (
        <>
          <h2 className="mb-4 font-display text-2xl font-semibold text-foreground">Je bedrijfsprofiel</h2>
          <ProfileFields value={profile} onChange={setProfile} userId={userId} />
          <div className="mt-6 flex justify-end"><Button disabled={profile.name.trim().length < 2 || !profile.city.trim()} onClick={() => setStep(2)}>Volgende</Button></div>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="mb-4 font-display text-2xl font-semibold text-foreground">Koppel je aanbod</h2>
          <FeedFields feedType={feedType} feedUrl={feedUrl} onChange={(t, u) => { setFeedType(t); setFeedUrl(u); }} />
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Terug</Button>
            <Button disabled={feedType !== "handmatig" && !/^https?:\/\//.test(feedUrl)} onClick={() => setStep(3)}>Volgende</Button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <h2 className="font-display text-2xl font-semibold text-foreground">Klaar om live te gaan</h2>
          <p className="mt-2 text-muted-foreground">
            {profile.name} krijgt een eigen pagina op Woonaanbod NL.{" "}
            {feedType === "handmatig" ? "Daarna voeg je woningen toe vanuit je dashboard." : "Je aanbod wordt nu opgehaald en daarna elke nacht automatisch bijgewerkt."}
          </p>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Terug</Button>
            <Button onClick={save} disabled={saving} className="gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Profiel live zetten</Button>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Dashboard ── */
const Dashboard = ({ agency, userId }: { agency: Agency; userId: string }) => {
  const qc = useQueryClient();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [feedType, setFeedType] = useState<FeedType>(agency.feed_type);
  const [feedUrl, setFeedUrl] = useState(agency.feed_url || "");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setProfile({ name: agency.name, city: agency.city || "", website: agency.website || "", phone: agency.phone || "", email: agency.email || "", description: agency.description || "", logo_url: agency.logo_url || "" });
  }, [agency]);

  const { data: stats } = useQuery({
    queryKey: ["agency-stats", agency.id],
    queryFn: async () => (await supabase.rpc("agency_dashboard_stats", { _days: 30 })).data as { active: number; views: number; clicks: number; leads: number } | null,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["agency-properties", userId],
    queryFn: async () => (await supabase.from("properties").select("id, title, city, price, status, listing_type, address_slug, slug, created_at, agency_id")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  const refresh = () => { qc.invalidateQueries({ queryKey: ["my-agency"] }); qc.invalidateQueries({ queryKey: ["agency-properties"] }); qc.invalidateQueries({ queryKey: ["agency-stats"] }); };

  const saveProfile = async () => {
    const { error } = await supabase.from("agencies").update({
      name: profile.name.trim(), city: profile.city.trim() || null, website: profile.website.trim() || null, phone: profile.phone.trim() || null,
      email: profile.email.trim() || null, description: profile.description.trim() || null, logo_url: profile.logo_url || null,
    }).eq("id", agency.id);
    error ? toast({ variant: "destructive", title: "Opslaan mislukt", description: error.message }) : (toast({ title: "Profiel opgeslagen" }), refresh());
  };

  const saveFeed = async () => {
    const { error } = await supabase.from("agencies").update({ feed_type: feedType, feed_url: feedType === "handmatig" ? null : feedUrl.trim() || null }).eq("id", agency.id);
    if (error) return toast({ variant: "destructive", title: "Opslaan mislukt", description: error.message });
    toast({ title: "Feed opgeslagen" }); refresh();
  };

  const syncNow = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke("agency-feed-import", { body: { mode: "sync" } });
    setSyncing(false);
    if (error || data?.error) toast({ variant: "destructive", title: "Synchroniseren mislukt", description: data?.error || "Probeer het later opnieuw." });
    else toast({ title: "Aanbod bijgewerkt", description: `${data.inserted} nieuw, ${data.updated} bijgewerkt, ${data.offline} offline.` });
    refresh();
  };

  const toggleStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("properties").update({ status: status === "actief" ? "inactief" : "actief" }).eq("id", id);
    error ? toast({ variant: "destructive", title: "Wijzigen mislukt", description: error.message }) : refresh();
  };

  const statCards = [
    { icon: Home, label: "Actieve woningen", value: stats?.active ?? properties.filter((p) => p.status === "actief").length },
    { icon: Eye, label: "Vertoningen (30 dagen)", value: stats?.views ?? 0 },
    { icon: MousePointerClick, label: "Clicks naar jou", value: stats?.clicks ?? 0 },
    { icon: MessageSquare, label: "Reacties", value: stats?.leads ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{agency.name}</h1>
          <Link to={`/makelaars/${agency.slug}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">Bekijk je openbare pagina <ExternalLink className="h-3.5 w-3.5" /></Link>
        </div>
        <Button asChild className="gap-2"><Link to="/aanbod-toevoegen"><Plus className="h-4 w-4" />Woning toevoegen</Link></Button>
      </div>
      {!agency.is_visible && <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">Je profiel is tijdelijk verborgen door de beheerder. Neem contact op via info@woonaanbod-nl.nl.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg border bg-card p-5">
            <Icon className="h-5 w-5 text-primary" />
            <div className="mt-2 font-display text-3xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-semibold text-foreground">
              Feedstatus
              <Badge variant={agency.feed_last_status === "fout" ? "destructive" : "secondary"}>
                {agency.feed_type === "handmatig" ? "Handmatig" : agency.feed_last_status === "ok" ? "Werkt" : agency.feed_last_status === "fout" ? "Fout" : agency.feed_last_status === "leeg" ? "Leeg" : "Nog niet gesynchroniseerd"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {agency.feed_last_sync_at ? `Laatste sync ${new Date(agency.feed_last_sync_at).toLocaleString("nl-NL")}. ${agency.feed_last_message || ""}` : agency.feed_type === "handmatig" ? "Je voegt woningen zelf toe." : "Elke nacht automatisch."}
            </p>
          </div>
          {agency.feed_type !== "handmatig" && agency.feed_url && (
            <Button variant="outline" onClick={syncNow} disabled={syncing} className="gap-2">{syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Nu synchroniseren</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="woningen">
        <TabsList>
          <TabsTrigger value="woningen">Woningen ({properties.length})</TabsTrigger>
          <TabsTrigger value="profiel">Bedrijfsprofiel</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
        </TabsList>
        <TabsContent value="woningen" className="mt-4">
          {properties.length === 0 ? (
            <p className="text-muted-foreground">Nog geen woningen. Koppel een feed of voeg een woning toe.</p>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {properties.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <a href={propertyUrl(p)} target="_blank" rel="noopener" className="font-medium text-foreground hover:text-primary">{p.title}</a>
                    <div className="text-sm text-muted-foreground">{p.city} · €{Number(p.price).toLocaleString("nl-NL")} · {p.listing_type === "koop" ? "Koop" : "Huur"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === "actief" ? "default" : "secondary"}>{p.status === "actief" ? "Online" : "Offline"}</Badge>
                    {!p.agency_id || agency.feed_type === "handmatig" ? (
                      <Button size="sm" variant="outline" asChild><Link to={`/aanbod/${p.id}/bewerken`}>Bewerken</Link></Button>
                    ) : null}
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(p.id, p.status)}>{p.status === "actief" ? "Offline halen" : "Weer online"}</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="profiel" className="mt-4 rounded-lg border bg-card p-6">
          <ProfileFields value={profile} onChange={setProfile} userId={userId} />
          <div className="mt-6 flex justify-end"><Button onClick={saveProfile} disabled={profile.name.trim().length < 2}>Profiel opslaan</Button></div>
        </TabsContent>
        <TabsContent value="feed" className="mt-4 rounded-lg border bg-card p-6">
          <FeedFields feedType={feedType} feedUrl={feedUrl} onChange={(t, u) => { setFeedType(t); setFeedUrl(u); }} />
          <div className="mt-6 flex justify-end"><Button onClick={saveFeed} disabled={feedType !== "handmatig" && !/^https?:\/\//.test(feedUrl)}>Feed opslaan</Button></div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MakelaarPortal = () => {
  const { user, loading } = useAuth() as { user: { id: string; email?: string } | null; loading?: boolean };
  const { data: agency, isLoading, refetch } = useQuery({ queryKey: ["my-agency", user?.id], enabled: !!user, queryFn: fetchMyAgency });

  if (!loading && !user) return <Navigate to="/aanmelden?redirect=/makelaar-portal" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead title="Makelaar Portal | Woonaanbod NL" description="Beheer je makelaarsprofiel, feed en woningaanbod op Woonaanbod NL." noindex />
      <Header />
      <main className="container flex-1 py-8">
        {!user || isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : agency ? (
          <Dashboard agency={agency} userId={user.id} />
        ) : (
          <>
            <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Plaats je woningaanbod gratis</h1>
            <p className="mb-6 text-muted-foreground">In drie stappen staat je aanbod online.</p>
            <Onboarding userId={user.id} defaultEmail={user.email || ""} onDone={() => refetch()} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MakelaarPortal;
