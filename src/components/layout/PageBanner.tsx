interface PageBannerProps {
  image: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Modern editorial split-layout banner.
 * Text/breadcrumbs/headline land in the left column via `children`,
 * the supplied image renders in a framed card on the right (mobile: strip on top).
 */
const PageBanner = ({ image, alt, children, className = "" }: PageBannerProps) => {
  return (
    <section
      className={`relative overflow-hidden border-b border-border bg-sun-tint ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-sun/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-24 h-[360px] w-[360px] rounded-full bg-sun-soft blur-3xl"
        aria-hidden
      />

      <div className="container relative grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:py-16">
        <div className="relative z-10 min-w-0">{children}</div>

        <div className="relative hidden lg:block">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <div
              className="absolute -inset-3 -rotate-2 rounded-[2rem] bg-sun shadow-lg"
              aria-hidden
            />
            <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] border-2 border-foreground/5 bg-card shadow-xl">
              <img
                src={image}
                alt={alt}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-foreground/5 shadow-md lg:hidden">
          <img
            src={image}
            alt={alt}
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

export default PageBanner;
