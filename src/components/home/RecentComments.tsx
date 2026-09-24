import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { MessageCircle, User, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { propertyPath } from "@/lib/propertyUrl";

const RecentComments = () => {
  const { data } = useQuery({
    queryKey: ["home-recent-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_comments")
        .select("id, name, content, created_at, properties(id, title, city, listing_type, slug, address_slug)")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="border-t border-border py-16 md:py-20">
      <div className="container">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <MessageCircle className="h-3.5 w-3.5" />
              Reacties
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Wat woningzoekers zeggen
            </h2>
            <p className="mt-2 text-muted-foreground">
              Ervaringen, vragen en tips van bezoekers bij het actuele aanbod.
            </p>
          </div>
          <Link
            to="/reacties"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-foreground hover:text-sun md:inline-flex"
          >
            Alle reacties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {data.map((c: any) => (
            <article key={c.id} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: nl })}
                  </p>
                </div>
              </div>
              <p className="line-clamp-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {c.content}
              </p>
              {c.properties && (
                <Link
                  to={propertyPath(c.properties)}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium text-primary hover:underline"
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {c.properties.title}
                    {c.properties.city ? `, ${c.properties.city}` : ""}
                  </span>
                </Link>
              )}
            </article>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/reacties" className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
            Alle reacties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentComments;
