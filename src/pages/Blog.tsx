import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SEOHead from "@/components/seo/SEOHead";
import { useBlogPosts } from "@/hooks/useBlog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
    : "";

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts(true);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Woningnieuws & huurtips | Blog Woonaanbod NL"
        description="Actueel nieuws over de Nederlandse woningmarkt, huurprijzen, regels en praktische tips voor huurders en kopers."
        canonical="/blog"
      />
      <Header />
      <main className="container py-10">
        <Breadcrumbs items={[{ label: "Blog", href: "/blog" }]} />

        <header className="mb-10 max-w-3xl">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Woningnieuws en huurtips
          </h1>
          <p className="mt-3 text-muted-foreground">
            Elke paar dagen een nieuw artikel over de woningmarkt: prijzen, regels, wijken en
            praktische tips om sneller een woning te vinden.
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <p className="text-muted-foreground">
            Er zijn nog geen artikelen gepubliceerd. Kom binnenkort terug.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      loading="lazy"
                      className="h-44 w-full object-cover"
                    />
                  )}
                  <CardContent className="space-y-3 p-5">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(post.published_at || post.created_at)}
                    </p>
                    <h2 className="font-display text-lg font-semibold leading-snug group-hover:text-primary">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
