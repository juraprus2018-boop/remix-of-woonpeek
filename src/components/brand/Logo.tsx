import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

interface LogoProps {
  className?: string;
  size?: string;
  variant?: "dark" | "light";
}

export function Logo({ className, size = "h-11 md:h-12", variant = "dark" }: LogoProps) {
  const isLight = variant === "light";
  return (
    <span
      translate="no"
      data-no-translate
      className={cn(
        "inline-flex items-center gap-2 leading-none notranslate",
        isLight ? "text-white" : "text-foreground",
        size,
        className,
      )}
      aria-label={BRAND_NAME}
    >
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="h-[1.2em] w-[1.2em] shrink-0"
        fill="none"
      >
        <rect x="2" y="2" width="32" height="32" rx="10" fill="hsl(var(--primary))" />
        <path
          d="M9.5 19.5L18 12l8.5 7.5"
          stroke="hsl(var(--sun))"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 20.5v6.2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6.2"
          stroke="hsl(var(--sun))"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-[1.5em] tracking-[-0.04em]" translate="no" data-no-translate>
        woonaanbod<span className="text-accent font-bold">-nl.nl</span>
      </span>

    </span>
  );
}

export default Logo;
