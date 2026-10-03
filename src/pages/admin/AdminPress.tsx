import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { PRESS_KIND_LABEL, formatDateNL, usePressContact } from "@/lib/press";

const AdminPress = () => {
  const qc = useQueryClient();
  const { data: contact } = usePressContact();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (contact) setForm({ name: contact.name ?? "", email: contact.email ?? "", phone: contact.phone ?? "" }); }, [contact]);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-press"],
    queryFn: async () => (await supabase.from("press_releases").select("id, slug, kind, title, status, published_at, sample_size").order("published_at", { ascending: false }).limit(200)).data ?? [],
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["admin-press-log"],
    queryFn: async () => (await supabase.from("press_generation_log").select("*").order("created_at", { ascending: false }).limit(15)).data ?? [],
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-press"] }); qc.invalidateQueries({ queryKey: ["admin-press-log"] }); qc.invalidateQueries({ queryKey: ["press-list"] }); };

  const saveContact = async () => {
    const { error } = await supabase.from("site_settings").update({ value: form }).eq("key", "press_contact");
    if (error) return toast({ variant: "destructive", title: "Opslaan mislukt", description: error.message });
    qc.invalidateQueries({ queryKey: ["press-contact"] });
    toast({ title: "Perscontact opgeslagen" });
  };
  const generate = async (kind: "lokaal" | "landelijk") => {
    setBusy(kind);
    const { data, error } = await supabase.functions.invoke("press-generate", { body: { kind, manual: true } });
    setBusy(null);
    if (error) return toast({ variant: "destructive", title: "Mislukt", description: error.message });
    toast({ title: data?.published ? "Gepubliceerd" : "Niet gepubliceerd", description: data?.published?.slug ?? data?.skipped });
    refresh();
  };
  const toggle = async (id: string, status: string) => {
    const { error } = await supabase.from("press_releases").update({ status: status === "published" ? "hidden" : "published" }).eq("id", id);
    if (error) return toast({ variant: "destructive", title: "Mislukt", description: error.message });
    refresh();
  };

  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-foreground">Pers</h1>
      <p className="mb-6 text-sm text-muted-foreground">Lokale update elke maandag 09:00, Huurmonitor elke 1e van de maand 09:00 (Amsterdamse tijd). Er wordt alleen gepubliceerd bij een nieuwe bevinding.</p>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 font-semibold">Perscontact</h2>
          <div className="space-y-2">
            <Input placeholder="Naam" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.slice(0, 100) })} />
            <Input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value.slice(0, 255) })} />
            <Input placeholder="Telefoon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.slice(0, 30) })} />
            <Button onClick={saveContact}>Opslaan</Button>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 font-semibold">Nu genereren</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={!!busy} onClick={() => generate("lokaal")}>{busy === "lokaal" ? "Bezig…" : "Lokale update"}</Button>
            <Button variant="outline" disabled={!!busy} onClick={() => generate("landelijk")}>{busy === "landelijk" ? "Bezig…" : "Huurmonitor"}</Button>
          </div>
          <h3 className="mb-1 mt-4 text-sm font-medium">Laatste runs</h3>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {logs.map((l) => <li key={l.id}>{new Date(l.created_at).toLocaleString("nl-NL")} · {l.kind} · <b>{l.status}</b> · {l.message}</li>)}
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground"><tr><th className="p-3">Publicatie</th><th className="p-3">Soort</th><th className="p-3">Datum</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3"><Link to={`/pers/${p.slug}`} className="font-medium text-primary hover:underline">{p.title}</Link><div className="text-muted-foreground">{p.sample_size} woningen</div></td>
                <td className="p-3">{PRESS_KIND_LABEL[p.kind]}</td>
                <td className="p-3">{formatDateNL(p.published_at)}</td>
                <td className="p-3"><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status === "published" ? "Online" : "Verborgen"}</Badge></td>
                <td className="p-3"><Button size="sm" variant="outline" onClick={() => toggle(p.id, p.status)}>{p.status === "published" ? "Verbergen" : "Tonen"}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default AdminPress;
