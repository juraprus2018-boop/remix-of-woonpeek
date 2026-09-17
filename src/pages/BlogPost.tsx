import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SEOHead from "@/components/seo/SEOHead";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlog";
import { addBlogAutoLinks } from "@/lib/blogAutoLinks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowLeft } from "lucide-react";

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
    : "";

const BlogPost = () => {
  const { slug = "" } = useParams();
  const { data: post, isLoading } = useBlogPost(slug);
  const { data: posts } = useBlogPosts(true);

  const related = (posts || []).filter((p) => p.slug !== slug).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-3xl py-10 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!post || post.status !== "published") {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Artikel niet gevonden | Woonaanbod NL" description="Dit artikel bestaat niet of is niet langer beschikbaar." noindex />
        <Header />
        <main className="container py-16 text-center">
          <h1 className="font-display text-2xl font-bold">Dit artikel bestaat niet (meer)</h1>
          <p className="mt-3 text-muted-foreground">Bekijk alle artikelen op de blogpagina.</p>
          <Button asChild className="mt-6">
            <Link to="/blog">Naar de blog</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.meta_title || `${post.title} | Woonaanbod NL`}
        description={post.meta_description || post.excerpt || post.title}
        canonical={`/blog/${post.slug}`}
        ogImage={post.cover_image || undefined}
        ogType="article"
      />
      <Header />
      <main className="container py-10">
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.title, href: `/blog/${post.slug}` },
          ]}
        />

        <article className="mx-auto mt-6 max-w-3xl">
          <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {formatDate(post.published_at || post.created_at)}
          </p>

          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="mt-6 w-full rounded-xl object-cover"
            />
          )}

          <div
            className="prose prose-slate mt-8 max-w-none dark:prose-invert prose-headings:font-display prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: addBlogAutoLinks(post.content) }}
          />

          <div className="mt-12">
            <Button asChild variant="outline">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Alle artikelen
              </Link>
            </Button>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mx-auto mt-16 max-w-3xl">
            <h2 className="font-display text-xl font-semibold">Meer lezen</h2>
            <ul className="mt-4 space-y-3">
              {related.map((p) => (
                <li key={p.id}>
                  <Link to={`/blog/${p.slug}`} className="text-primary hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
