import { getStockPropertyImage } from "@/lib/stockImages";

interface StockBannerProps {
  seed: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  /** Optional override URL. */
  image?: string;
  className?: string;
}

/**
 * Reusable hero banner for interior pages. Uses a deterministic stock
 * interior photo as the background and overlays a dark gradient so titles stay legible.
 */
const StockBanner = ({ seed, title, subtitle, children, image, className = "" }: StockBannerProps) => {
  const src = image || getStockPropertyImage(seed);
  return (
    <section className={`relative overflow-hidden border-b ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/65 to-foreground/40" />
      <div className="container relative py-12 md:py-16">
        {children}
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-background md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-base text-background/85 md:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
};

export default StockBanner;
