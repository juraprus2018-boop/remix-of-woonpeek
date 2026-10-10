import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";
import colorLogo from "@/assets/brand/logo-color.png.asset.json";
import whiteLogo from "@/assets/brand/logo-white.png.asset.json";

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
        "inline-flex max-w-full shrink-0 items-center leading-none notranslate",
        size,
        className,
      )}
      aria-label={BRAND_NAME}
    >
      <img
        src={isLight ? whiteLogo.url : colorLogo.url}
        alt={BRAND_NAME}
        width={1920}
        height={283}
        className="h-auto max-h-full w-[220px] max-w-full object-contain sm:w-[280px]"
        fetchPriority="high"
      />
    </span>
  );
}

export default Logo;
