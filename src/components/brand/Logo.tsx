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


      <span className="font-display text-[1.25em] tracking-[-0.04em] whitespace-nowrap sm:text-[1.5em]" translate="no" data-no-translate>
        woonaanbod<span className="text-accent font-bold">-nl.nl</span>
      </span>


    </span>
  );
}

export default Logo;
