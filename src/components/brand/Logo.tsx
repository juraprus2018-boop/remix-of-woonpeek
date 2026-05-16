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
 * Stekly botanical wordmark: heavy display + sage leaf glyph.
 */
export function Logo({
  className,
  size = "h-7",
  variant = "dark",
}: LogoProps) {
  const text = variant === "dark" ? "text-foreground" : "text-background";
  const leafFill = variant === "dark" ? "hsl(var(--accent))" : "hsl(var(--background))";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 leading-none",
        size,
        text,
        className
      )}
      aria-label={BRAND_NAME}
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        className="h-[1.1em] w-[1.1em] shrink-0"
        fill="none"
      >
        <path
          d="M16 3C9 3 4 9 4 16c0 7 5 13 12 13 0-7-2-13-2-13s5 0 9-4c4-4 3-9 3-9s-5-0-10 0z"
          fill={leafFill}
        />
        <path
          d="M14 29c0-7 4-13 12-18"
          stroke="hsl(var(--background))"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
      <span
        className="font-display text-[1.25em] lowercase tracking-[-0.04em]"
      >
        {BRAND_NAME.toLowerCase()}
      </span>
    </span>
  );
}

export default Logo;
