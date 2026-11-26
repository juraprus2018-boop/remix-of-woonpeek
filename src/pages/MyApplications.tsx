import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Home, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/lib/router-compat";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APPLICATION_STATUSES, viewingIcs } from "@/lib/applicationTracker";

const MyApplications = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const key = ["housing-applications", user?.id];

  const { data = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("housing_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const onError = () => toast.error("Opslaan lukte niet, probeer het opnieuw.");

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("housing_applications").insert({ user_id: user!.id, title: title.trim(), url: url.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => { setTitle(""); setUrl(""); refresh(); },
    onError,
  });

  const update = useMutation({
    mutationFn: async (v: { id: string; status?: string; viewing_at?: string | null; notes?: string }) => {
      const { id, ...rest } = v;
      const { error } = await supabase.from("housing_applications").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("housing_applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError,
  });

  const foundHome = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("search_alerts").update({ is_active: false }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Gefeliciteerd! Je zoekalerts zijn gepauzeerd. Je kunt ze altijd weer aanzetten."),
    onError,
  });

  const downloadIcs = (a: { id: string; title: string; url: string | null; viewing_at: string }) => {
    const blob = new Blob([viewingIcs({ id: a.id, title: a.title, url: a.url, start: new Date(a.viewing_at) })], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bezichtiging.ics";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-8">
        <h1 className="font-display text-3xl font-bold">Mijn reacties en bezichtigingen</h1>
        <p className="mt-2 text-muted-foreground">Houd zelf bij waar je op hebt gereageerd. Alleen jij ziet deze lijst.</p>

        {!user ? (
          <p className="mt-6">
            <Link to="/login" className="font-semibold text-primary underline">Log in</Link> om je reacties bij te houden.
          </p>
        ) : (
          <>
            <form
              className="mt-6 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[2fr_2fr_auto]"
              onSubmit={(e) => { e.preventDefault(); if (title.trim()) add.mutate(); }}
            >
              <Input placeholder="Woning, bijv. Leeghwater, Amersfoort" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Woning" required />
              <Input placeholder="Link naar de woning (optioneel)" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Link" type="url" />
              <Button type="submit" disabled={add.isPending}>Toevoegen</Button>
            </form>

            <div className="mt-6 space-y-3">
              {isLoading ? <div className="h-24 animate-pulse rounded-xl border bg-card" /> : data.length === 0 ? (
                <p className="text-muted-foreground">Nog geen reacties toegevoegd.</p>
              ) : data.map((a) => (
                <article key={a.id} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[2fr_1fr_1.3fr_auto] md:items-center">
                  <div>
                    <h2 className="font-semibold">{a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{a.title}</a> : a.title}</h2>
                    <p className="text-xs text-muted-foreground">Toegevoegd op {new Date(a.created_at).toLocaleDateString("nl-NL")}</p>
                  </div>
                  <select
                    aria-label="Status"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={a.status}
                    onChange={(e) => update.mutate({ id: a.id, status: e.target.value })}
                  >
                    {APPLICATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <Input
                    type="datetime-local"
                    aria-label="Bezichtiging"
                    defaultValue={a.viewing_at ? new Date(new Date(a.viewing_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onBlur={(e) => update.mutate({ id: a.id, viewing_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  />
                  <div className="flex gap-2">
                    {a.viewing_at && (
                      <Button variant="outline" size="icon" aria-label="Zet in agenda" onClick={() => downloadIcs({ ...a, viewing_at: a.viewing_at! })}>
                        <CalendarPlus className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" aria-label="Verwijderen" onClick={() => remove.mutate(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <section className="mt-10 rounded-xl border bg-card p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><Home className="h-5 w-5 text-primary" /> Woning gevonden?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pauzeer al je zoekalerts in één keer. Je gegevens blijven bewaard.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => foundHome.mutate()} disabled={foundHome.isPending}>Ik heb een woning gevonden</Button>
                <Button variant="outline" asChild><Link to="/verhuischecklist">Naar de verhuischecklist</Link></Button>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyApplications;
