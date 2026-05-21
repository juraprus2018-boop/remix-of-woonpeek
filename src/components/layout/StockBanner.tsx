import { getStockPropertyImage } from "@/lib/stockImages";

interface StockBannerProps {
  seed: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  /** Optional override URL. */
  image?: string;
  /** Small uppercase label above the title (e.g. "Aanbod", "Favorieten"). */
  eyebrow?: string;
  className?: string;
}

/**
 * Editorial split-layout banner for interior pages.
 * Left: typographic block (eyebrow, headline, subtitle, breadcrumbs/children).
 * Right: stock interior photo in a framed card with a soft accent backdrop.
 * Stacks on mobile with the photo as a compact strip.
 */
const StockBanner = ({
  seed,
  title,
  subtitle,
  children,
  image,
  eyebrow,
  className = "",
}: StockBannerProps) => {
  const src = image || getStockPropertyImage(seed);

  return (
    <section
      className={`relative overflow-hidden border-b border-border bg-sun-tint ${className}`}
    >
      {/* Soft decorative blobs */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-sun/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-24 h-[360px] w-[360px] rounded-full bg-sun-soft blur-3xl"
        aria-hidden
      />

      <div className="container relative grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:py-16">
        {/* Text column */}
        <div className="relative z-10 min-w-0">
          {children && <div className="mb-4">{children}</div>}
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-background">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <span
            className="mt-4 block h-1.5 w-16 rounded-full bg-sun"
            aria-hidden
          />
          {subtitle && (
            <p className="mt-5 max-w-xl text-base text-foreground/70 md:text-lg">
              {subtitle}
            </p>
          )}
        </div>

        {/* Image column */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <div
              className="absolute -inset-3 -rotate-2 rounded-[2rem] bg-sun shadow-lg"
              aria-hidden
            />
            <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] border-2 border-foreground/5 bg-card shadow-xl">
              <img
                src={src}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mobile / tablet image strip */}
        <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-foreground/5 shadow-md lg:hidden">
          <img
            src={src}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/10 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default StockBanner;
