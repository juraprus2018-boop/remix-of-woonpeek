import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Hoogte in tailwind units, bijv. "h-7" */
  size?: string;
  /** Toon donkere variant (op licht canvas) of lichte (op donker canvas) */
  variant?: "dark" | "light";
  /** Toon merkdot in elektrisch limoen */
  withDot?: boolean;
}

/**
 * Domora wordmark. Ultra-clean Swiss: lowercase, tight tracking,
 * een opvallende elektrisch-limoen punt achter de naam als signatuur.
 */
export function Logo({
  className,
  size = "h-7",
  variant = "dark",
  withDot = true,
}: LogoProps) {
  const text = variant === "dark" ? "text-foreground" : "text-background";
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display font-bold leading-none tracking-tight",
        size,
        text,
        className
      )}
      aria-label="Domora"
    >
      <span className="text-[1.5em]" style={{ letterSpacing: "-0.04em" }}>
        domora
      </span>
      {withDot && (
        <span
          aria-hidden
          className="ml-[0.08em] inline-block rounded-full bg-accent"
          style={{ width: "0.3em", height: "0.3em" }}
        />
      )}
    </span>
  );
}

export default Logo;
