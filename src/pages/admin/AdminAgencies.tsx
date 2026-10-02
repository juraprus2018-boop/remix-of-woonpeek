import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const AdminAgencies = () => {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
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
  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-foreground">Aangesloten makelaars</h1>
      <p className="mb-6 text-sm text-muted-foreground">Feeds worden elke nacht om 05:45 (NL) gesynchroniseerd.</p>
      {isLoading ? <p>Laden…</p> : data.length === 0 ? <p className="text-muted-foreground">Nog geen makelaars aangemeld.</p> : (
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
                  <td className="p-3"><Button size="sm" variant="outline" onClick={() => toggle(a.id, a.is_visible)}>{a.is_visible ? "Verbergen" : "Tonen"}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};
export default AdminAgencies;
