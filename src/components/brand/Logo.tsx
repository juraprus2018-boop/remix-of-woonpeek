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
 * Stekly wordmark met pin-icoon in accent (warm oranje).
 * Lowercase, tight tracking, modern.
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
        "inline-flex items-center gap-1.5 font-display font-bold leading-none tracking-tight",
        size,
        text,
        className
      )}
      aria-label={BRAND_NAME}
    >
      {/* Pin icoon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-[1.15em] w-[1.15em] shrink-0"
        aria-hidden
      >
        <path
          d="M12 2C7.58 2 4 5.58 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.42-3.58-8-8-8z"
          fill="hsl(var(--accent))"
        />
        <circle cx="12" cy="10" r="3" fill="hsl(var(--background))" />
      </svg>
      <span
        className="text-[1.5em] lowercase"
        style={{ letterSpacing: "-0.04em" }}
      >
        {BRAND_NAME.toLowerCase()}
      </span>
    </span>
  );
}

export default Logo;
