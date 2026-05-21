import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";
import logoSrc from "@/assets/logo-huurbaasje-geel.png";

interface LogoProps {
  className?: string;
  size?: string;
  variant?: "dark" | "light";
}

export function Logo({ className, size = "h-14", variant = "dark" }: LogoProps) {
  return (
    <span
      className={cn("inline-flex items-center leading-none", size, className)}
      aria-label={BRAND_NAME}
    >
      <img
        src={logoSrc}
        alt={BRAND_NAME}
        className="h-full w-auto object-contain"
        loading="eager"
        decoding="async"
      />
    </span>
  );
}

export default Logo;
