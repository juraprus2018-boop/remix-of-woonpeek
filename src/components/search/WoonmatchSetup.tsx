import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveWoonmatch, useWoonmatch } from "@/lib/woonmatch";

const types = [
  { v: "", l: "Maakt niet uit" },
  { v: "appartement", l: "Appartement" },
  { v: "huis", l: "Huis" },
  { v: "studio", l: "Studio" },
  { v: "kamer", l: "Kamer" },
];

export default function WoonmatchSetup() {
  const profile = useWoonmatch();
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(profile?.maxBudget ? String(profile.maxBudget) : "");
  const [rooms, setRooms] = useState(profile?.minRooms ? String(profile.minRooms) : "");
  const [type, setType] = useState(profile?.propertyType ?? "");
  const [city, setCity] = useState(profile?.city ?? "");

  const save = () => {
    const b = Number(budget);
    const r = Number(rooms);
    saveWoonmatch({
      maxBudget: b > 0 && b < 100000 ? Math.round(b) : undefined,
      minRooms: r > 0 && r < 20 ? Math.round(r) : undefined,
      propertyType: type || undefined,
      city: city.trim().slice(0, 80) || undefined,
    });
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="font-semibold text-foreground">
              {profile ? "Jouw Woonmatch staat aan" : "Zie direct welke woning bij je past"}
            </p>
            <p className="text-sm text-muted-foreground">
              {profile
                ? [
                    profile.maxBudget && `max € ${profile.maxBudget}`,
                    profile.minRooms && `${profile.minRooms}+ kamers`,
                    profile.propertyType,
                    profile.city,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Geen voorkeuren"
                : "Stel je budget en wensen in, dan krijgt elke woning een matchscore."}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setOpen(true)}>
            {profile ? "Aanpassen" : "Woonmatch instellen"}
          </Button>
          {profile && (
            <Button size="sm" variant="ghost" onClick={() => saveWoonmatch(null)} aria-label="Woonmatch uitzetten">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="mb-3 font-semibold text-foreground">Jouw Woonmatch</p>
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="wm-budget">Max huur per maand</Label>
          <Input id="wm-budget" inputMode="numeric" placeholder="1500" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))} />
        </div>
        <div>
          <Label htmlFor="wm-rooms">Minimaal kamers</Label>
          <Input id="wm-rooms" inputMode="numeric" placeholder="2" value={rooms} onChange={(e) => setRooms(e.target.value.replace(/\D/g, ""))} />
        </div>
        <div>
          <Label htmlFor="wm-type">Woningtype</Label>
          <select id="wm-type" value={type} onChange={(e) => setType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            {types.map((t) => (
              <option key={t.v} value={t.v}>{t.l}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="wm-city">Voorkeursplaats</Label>
          <Input id="wm-city" placeholder="Utrecht" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={save}>Opslaan</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Annuleren</Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Alleen op dit apparaat opgeslagen, geen account nodig.</p>
    </div>
  );
}
