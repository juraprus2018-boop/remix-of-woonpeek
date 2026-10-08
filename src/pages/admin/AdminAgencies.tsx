import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";

const AdminAgencies = () => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["admin-agencies"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_agencies");
      if (error) throw error;
      return data ?? [];
    },
  });
  const toggle = async (id: string, visible: boolean) => {
    const { error } = await supabase.rpc("admin_set_agency_visible", { _id: id, _visible: !visible });
    if (error) return toast({ variant: "destructive", title: "Mislukt", description: error.message });
    qc.invalidateQueries({ queryKey: ["admin-agencies"] });
  };
  const remove = async () => {
    if (!selected || deleting) return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("admin_delete_agency", { _id: selected.id });
      if (error) throw error;
      setSelected(null);
      await qc.invalidateQueries({ queryKey: ["admin-agencies"] });
      await qc.invalidateQueries({ queryKey: ["agencies"] });
      toast({ title: "Makelaar verwijderd", description: "De aansluiting is gestopt en de woningen zijn inactief gemaakt. Het gebruikersaccount blijft bestaan." });
    } catch (error) {
      toast({ variant: "destructive", title: "Verwijderen mislukt", description: error instanceof Error ? error.message : "Probeer het opnieuw." });
    } finally {
      setDeleting(false);
    }
  };
  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-foreground">Aangesloten makelaars</h1>
      <p className="mb-6 text-sm text-muted-foreground">Feeds worden elke nacht om 05:45 (NL) gesynchroniseerd.</p>
      {isLoading ? <p>Laden…</p> : isError ? <p className="text-destructive">Makelaars konden niet worden geladen. Probeer het opnieuw.</p> : data.length === 0 ? <p className="text-muted-foreground">Nog geen makelaars aangemeld.</p> : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground"><tr>
              <th className="p-3">Makelaar</th><th className="p-3">Feed</th><th className="p-3">Laatste sync</th><th className="p-3">Actief</th><th className="p-3"></th>
            </tr></thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-3"><Link to={`/makelaars/${a.slug}`} className="font-medium text-primary hover:underline">{a.name}</Link><div className="text-muted-foreground">{a.city} · {a.email}</div></td>
                  <td className="p-3">{a.feed_type}<div className="max-w-xs truncate text-muted-foreground">{a.feed_url}</div></td>
                  <td className="p-3">
                    <Badge variant={a.feed_last_status === "fout" ? "destructive" : "secondary"}>{a.feed_last_status || "nog niet"}</Badge>
                    <div className="mt-1 text-muted-foreground">{a.feed_last_sync_at ? new Date(a.feed_last_sync_at).toLocaleString("nl-NL") : ""} {a.feed_last_message}</div>
                  </td>
                  <td className="p-3">{a.active_count}</td>
                   <td className="p-3"><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => toggle(a.id, a.is_visible)}>{a.is_visible ? "Verbergen" : "Tonen"}</Button><Button size="sm" variant="destructive" onClick={() => setSelected({ id: a.id, name: a.name })} aria-label={`Verwijder ${a.name}`}><Trash2 className="mr-2 h-4 w-4" />Verwijderen</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AlertDialog open={selected !== null} onOpenChange={(open) => { if (!open && !deleting) setSelected(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Makelaar verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>{selected?.name} wordt verwijderd uit de aangesloten makelaars. Het bedrijfsprofiel en de feedkoppeling verdwijnen. Alle gekoppelde woningen worden inactief; hun historie en het gebruikersaccount blijven behouden. Dit kun je niet ongedaan maken.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuleren</AlertDialogCancel>
            <Button variant="destructive" disabled={deleting} onClick={remove}>{deleting ? "Verwijderen…" : "Ja, verwijderen"}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};
export default AdminAgencies;
