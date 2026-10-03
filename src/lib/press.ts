import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PressContact { name: string; email: string; phone?: string }
export interface PressChart { type: "bar"; title: string; unit: string; rows: { label: string; value: number }[] }
export interface PressTable { columns: string[]; rows: (string | number)[][] }

export const PRESS_KIND_LABEL: Record<string, string> = {
  landelijk: "Woonaanbod Huurmonitor",
  lokaal: "Lokale update",
  handmatig: "Nieuws",
};

export const formatDateNL = (d: string) =>
  new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });

export const usePressContact = () =>
  useQuery({
    queryKey: ["press-contact"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "press_contact").maybeSingle();
      return (data?.value ?? { name: "Persvoorlichting Woonaanbod NL", email: "info@woonaanbod-nl.nl" }) as unknown as PressContact;
    },
  });

export function downloadCsv(filename: string, table: PressTable, meta: string[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [...meta.map((m) => esc(m)), "", table.columns.map(esc).join(";"), ...table.rows.map((r) => r.map(esc).join(";"))];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
