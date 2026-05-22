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
      className={cn(
        "inline-flex items-center gap-2 leading-none",
        isLight ? "text-white" : "text-foreground",
        size,
        className,
      )}
      aria-label={BRAND_NAME}
    >
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="h-[1.25em] w-[1.25em] shrink-0"
        fill="none"
      >
        <rect x="2" y="2" width="32" height="32" rx="9" fill="hsl(var(--sun))" />
        <path
          d="M10 20l8-7 8 7v7a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 10 27v-7z"
          fill="hsl(var(--foreground))"
        />
        <rect x="16.5" y="22.5" width="3" height="6" rx="0.6" fill="hsl(var(--sun))" />
      </svg>
      <span className="font-display text-[1.35em] lowercase tracking-[-0.045em]">
        huurbaasje<span className="text-sun">.</span>
      </span>
    </span>
  );
}

export default Logo;
