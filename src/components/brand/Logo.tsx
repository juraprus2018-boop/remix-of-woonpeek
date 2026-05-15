import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

interface LogoProps {
  className?: string;
  /** Hoogte in tailwind units, bijv. "h-7" */
  size?: string;
  /** Donker logo (op licht canvas) of licht (op donker canvas) */
  variant?: "dark" | "light";
}

/**
 * Stekly editorial wordmark: serifachtig display + terracotta dot.
 */
export function Logo({
  className,
  size = "h-7",
  variant = "dark",
}: LogoProps) {
  const text = variant === "dark" ? "text-foreground" : "text-background";
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-serif-display leading-none",
        size,
        text,
        className
      )}
      aria-label={BRAND_NAME}
    >
      <span
        className="text-[1.6em] lowercase"
        style={{ letterSpacing: "-0.02em" }}
      >
        {BRAND_NAME.toLowerCase()}
      </span>
      <span
        aria-hidden
        className="inline-block h-[0.35em] w-[0.35em] rounded-full"
        style={{ backgroundColor: "hsl(var(--accent))" }}
      />
    </span>
  );
}

export default Logo;
