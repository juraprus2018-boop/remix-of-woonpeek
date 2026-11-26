import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/lib/router-compat";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildIntroText, maxRentForIncome, type TenantProfileInput } from "@/lib/tenantProfile";

const empty: TenantProfileInput = { household_size: null, monthly_income: null, employment: null, pets: false, smoker: false, move_in_from: null, intro: null };
const num = (v: string) => (v === "" ? null : Number(v));

const TenantProfile = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["tenant-profile", user?.id];
  const [form, setForm] = useState<TenantProfileInput>(empty);
  const [name, setName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const [tp, pr] = await Promise.all([
        supabase.from("tenant_profiles").select("*").maybeSingle(),
        supabase.from("profiles").select("display_name").eq("user_id", user!.id).maybeSingle(),
      ]);
      if (tp.error) throw tp.error;
      return { profile: tp.data, name: pr.data?.display_name ?? "" };
    },
  });

  useEffect(() => {
    if (!data) return;
    setName(data.name);
    if (data.profile) {
      const { household_size, monthly_income, employment, pets, smoker, move_in_from, intro } = data.profile;
      setForm({ household_size, monthly_income, employment, pets, smoker, move_in_from, intro });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tenant_profiles").upsert({ user_id: user!.id, ...form, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Huurdersprofiel opgeslagen"); qc.invalidateQueries({ queryKey: key }); },
    onError: () => toast.error("Opslaan lukte niet. Controleer de velden."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tenant_profiles").delete().eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => { setForm(empty); toast.success("Huurdersprofiel verwijderd"); qc.invalidateQueries({ queryKey: key }); },
  });

  const text = buildIntroText(name, form);
  const maxRent = maxRentForIncome(form.monthly_income);
  const set = <K extends keyof TenantProfileInput>(k: K, v: TenantProfileInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-8">
        <h1 className="font-display text-3xl font-bold">Mijn huurdersprofiel</h1>
        <p className="mt-2 text-muted-foreground">Optioneel en alleen voor jou. We delen niets automatisch met verhuurders en vragen geen documenten.</p>

        {!user ? (
          <p className="mt-6"><Link to="/login" className="font-semibold text-primary underline">Log in</Link> om je profiel in te vullen.</p>
        ) : isLoading ? <div className="mt-6 h-40 animate-pulse rounded-xl border bg-card" /> : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <form className="space-y-4 rounded-xl border bg-card p-5" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">Aantal personen
                  <Input type="number" min={1} max={20} className="mt-1" value={form.household_size ?? ""} onChange={(e) => set("household_size", num(e.target.value))} />
                </label>
                <label className="text-sm font-medium">Bruto maandinkomen (€)
                  <Input type="number" min={0} className="mt-1" value={form.monthly_income ?? ""} onChange={(e) => set("monthly_income", num(e.target.value))} />
                </label>
                <label className="text-sm font-medium">Werksituatie
                  <Input className="mt-1" placeholder="bijv. vast contract" value={form.employment ?? ""} onChange={(e) => set("employment", e.target.value || null)} />
                </label>
                <label className="text-sm font-medium">Beschikbaar vanaf
                  <Input type="date" className="mt-1" value={form.move_in_from ?? ""} onChange={(e) => set("move_in_from", e.target.value || null)} />
                </label>
              </div>
              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-primary" checked={form.pets} onChange={(e) => set("pets", e.target.checked)} /> Huisdieren</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-primary" checked={form.smoker} onChange={(e) => set("smoker", e.target.checked)} /> Roker</label>
              </div>
              <label className="block text-sm font-medium">Iets over jezelf
                <Textarea className="mt-1" rows={3} maxLength={600} value={form.intro ?? ""} onChange={(e) => set("intro", e.target.value || null)} />
              </label>
              {maxRent && (
                <p className="rounded-lg bg-muted p-3 text-sm">
                  Veel verhuurders vragen een inkomen van 3x de huur. Daarmee past een huur tot ongeveer <strong>€ {maxRent.toLocaleString("nl-NL")} per maand</strong>.{" "}
                  <Link to={`/woning-zoeken?max_prijs=${maxRent}`} className="font-semibold text-primary underline">Bekijk passende woningen</Link>
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={save.isPending}>Opslaan</Button>
                {data?.profile && <Button type="button" variant="outline" onClick={() => remove.mutate()}>Profiel verwijderen</Button>}
              </div>
            </form>

            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Je voorstelling</h2>
              <p className="mt-1 text-sm text-muted-foreground">Kopieer deze tekst en plak hem in je reactie bij de aanbieder.</p>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-muted p-4 font-sans text-sm">{text}</pre>
              <Button className="mt-3" variant="outline" onClick={() => { navigator.clipboard.writeText(text); toast.success("Tekst gekopieerd"); }}>
                <Copy className="mr-2 h-4 w-4" /> Kopieer tekst
              </Button>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TenantProfile;
