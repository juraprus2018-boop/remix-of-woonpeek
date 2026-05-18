import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

interface LogoProps {
  className?: string;
  size?: string;
  variant?: "dark" | "light";
}

/**
 * Stekly sunny wordmark: rounded heavy display + yellow house glyph.
 */
export function Logo({ className, size = "h-7", variant = "dark" }: LogoProps) {
  const text = variant === "dark" ? "text-foreground" : "text-background";
  const ink = variant === "dark" ? "hsl(var(--foreground))" : "hsl(var(--background))";
  return (
    <span
      className={cn("inline-flex items-center gap-2 leading-none", size, text, className)}
      aria-label={BRAND_NAME}
    >
      <svg
        viewBox="0 0 36 36"
        aria-hidden
        className="h-[1.25em] w-[1.25em] shrink-0"
        fill="none"
      >
        {/* Rounded yellow square */}
        <rect x="2" y="2" width="32" height="32" rx="9" fill="hsl(var(--sun))" />
        {/* House silhouette */}
        <path
          d="M10 20l8-7 8 7v7a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 10 27v-7z"
          fill={ink}
        />
        {/* Door */}
        <rect x="16.5" y="22.5" width="3" height="6" rx="0.6" fill="hsl(var(--sun))" />
      </svg>
      <span className="font-display text-[1.35em] lowercase tracking-[-0.045em]">
        {BRAND_NAME.toLowerCase()}
        <span className="text-sun">.</span>
      </span>
    </span>
  );
}

export default Logo;
