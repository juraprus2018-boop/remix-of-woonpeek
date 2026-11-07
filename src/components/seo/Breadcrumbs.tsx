import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => {
      const entry: Record<string, unknown> = {
        "@type": "ListItem",
        position: i + 1,
        name: item.label,
      };
      // Google requires `item` (URL) for every breadcrumb except the last
      if (item.href) {
        entry.item = `https://www.woonaanbod-nl.nl${item.href}`;
      } else if (i < items.length - 1) {
        // Non-last items without explicit href: use current page URL as fallback
        entry.item = `https://www.woonaanbod-nl.nl`;
      }
      return entry;
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="min-w-0 overflow-hidden text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex min-w-0 items-center gap-1 overflow-hidden">

          {items.map((item, i) => (
            <li key={i} className={`flex items-center gap-1 min-w-0 shrink-0 ${i === items.length - 1 ? 'shrink min-w-0' : ''}`}>
              {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
              {item.href && i < items.length - 1 ? (
                <Link to={item.href} className="hover:text-foreground transition-colors whitespace-nowrap">
                  {item.label}
                </Link>
              ) : (
                <span className={`${i === items.length - 1 ? 'text-foreground truncate block' : ''}`}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
