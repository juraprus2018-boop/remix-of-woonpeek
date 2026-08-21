import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/brand";
import { stripLocale, withLocale, getLocaleFromPath } from "@/lib/locale";

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline";
  align?: "start" | "center" | "end";
  className?: string;
}

export function LanguageSwitcher({ variant = "ghost", align = "end", className }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const current = getLocaleFromPath(location.pathname);

  const change = (lng: Locale) => {
    const bare = stripLocale(location.pathname);
    const target = withLocale(bare, lng) + location.search + location.hash;
    navigate(target);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={`gap-2 ${className ?? ""}`} aria-label={t("common.language")}>
          <Globe className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-xs font-medium uppercase tracking-wide">{current}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="min-w-[10rem]">
        {SUPPORTED_LOCALES.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => change(lng)}
            className={current === lng ? "bg-accent/10 font-semibold" : ""}
          >
            <span className="mr-2 text-xs uppercase tracking-wide text-muted-foreground">{lng}</span>
            {LOCALE_LABELS[lng]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
