import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StockBanner from "@/components/layout/StockBanner";
import SEOHead from "@/components/seo/SEOHead";

import PropertyCard from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/button";
import { useFavorites, useUpdateFavoriteNotify } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Loader2, Search, SlidersHorizontal, ArrowUpDown, Bell, BellOff, TrendingDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "recent" | "price-asc" | "price-desc" | "city";

const Favorites = () => {
  const { user } = useAuth();
  const { data: favorites, isLoading } = useFavorites();
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const sortedFavorites = useMemo(() => {
    if (!favorites) return [];
    const items = [...favorites];
    switch (sortBy) {
      case "price-asc":
        return items.sort((a, b) => {
          const pa = (a.properties as any)?.price || 0;
          const pb = (b.properties as any)?.price || 0;
          return pa - pb;
        });
      case "price-desc":
        return items.sort((a, b) => {
          const pa = (a.properties as any)?.price || 0;
          const pb = (b.properties as any)?.price || 0;
          return pb - pa;
        });
      case "city":
        return items.sort((a, b) => {
          const ca = (a.properties as any)?.city || "";
          const cb = (b.properties as any)?.city || "";
          return ca.localeCompare(cb);
        });
      default:
        return items;
    }
  }, [favorites, sortBy]);

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <SEOHead
          title="Favoriete woningen | Huurbaasje"
          description="Bewaar je favoriete woningen op Huurbaasje. Log in om je shortlist te bekijken en te beheren."
          canonical="https://www.huurbaasje.nl/favorieten"
          noindex
        />
        <Header />

        <main className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="relative mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold">
            Log in om je favorieten te bekijken
          </h1>
          <p className="mt-2 max-w-sm text-center text-muted-foreground">
            Maak een account aan of log in om woningen op te slaan en vergelijken
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg">
              <Link to="/login">Inloggen</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/aanmelden">Registreren</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SEOHead
        title="Mijn favoriete woningen | Huurbaasje"
        description="Bekijk en beheer je opgeslagen huur- en koopwoningen op Huurbaasje. Sorteer op prijs, stad of recent toegevoegd."
        canonical="https://www.huurbaasje.nl/favorieten"
        noindex
      />
      <Header />

      <main className="flex-1">
        <StockBanner
          seed="favorites"
          title="Mijn favorieten"
          subtitle={
            isLoading
              ? "Laden..."
              : `${favorites?.length || 0} opgeslagen ${favorites?.length === 1 ? "woning" : "woningen"}`
          }
        />
        <div className="container py-6 md:py-8">
          {/* Header with sort */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="sr-only">
              <h2>Favorieten</h2>
            </div>

            {favorites && favorites.length > 1 && (
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sorteer op" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent toegevoegd</SelectItem>
                    <SelectItem value="price-asc">Prijs laag → hoog</SelectItem>
                    <SelectItem value="price-desc">Prijs hoog → laag</SelectItem>
                    <SelectItem value="city">Stad A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedFavorites.length > 0 ? (
            <>
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">E-mailmeldingen actief</p>
                  <p className="text-muted-foreground">
                    Wij sturen je elke ochtend een mail wanneer de prijs van een opgeslagen woning daalt of de status verandert (verhuurd, verkocht, inactief). Zet meldingen per woning aan of uit hieronder.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                {sortedFavorites.map((favorite) => (
                  <FavoriteItem key={favorite.id} favorite={favorite} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold">
                Nog geen favorieten
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Vind je droomwoning en sla deze op door op het hartje te klikken.
                Zo kun je ze makkelijk terugvinden en vergelijken.
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link to="/vinden">
                    <Search className="mr-2 h-4 w-4" />
                    Zoek woningen
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/op-kaart">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Verkennen
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
