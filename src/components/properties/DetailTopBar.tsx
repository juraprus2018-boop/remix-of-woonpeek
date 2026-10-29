import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  fallbackHref: string;
  defaultCity?: string;
}

/** Terug naar overzicht + compacte zoekbalk op woningdetailpagina's. */
export default function DetailTopBar({ fallbackHref, defaultCity }: Props) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const goBack = () => {
    const sameSiteReferrer = document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (window.history.length > 1 && sameSiteReferrer) navigate(-1);
    else navigate(fallbackHref);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const value = q.trim();
    if (value) params.set("locatie", value);
    navigate(`/woning-zoeken${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="container flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
        <Button variant="ghost" size="sm" onClick={goBack} className="w-fit gap-2 px-2 font-semibold">
          <ArrowLeft className="h-4 w-4" />
          Terug naar overzicht
        </Button>
        <form onSubmit={submit} className="flex flex-1 gap-2" role="search">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={defaultCity ? `Zoek in ${defaultCity} of andere plaats` : "Zoek op plaats of postcode"}
              aria-label="Zoek woningen op plaats of postcode"
              className="h-10 pl-9"
            />
          </div>
          <Button type="submit" className="h-10">Zoeken</Button>
        </form>
      </div>
    </div>
  );
}
