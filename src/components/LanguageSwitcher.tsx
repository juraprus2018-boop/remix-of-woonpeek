import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/brand";

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline";
  align?: "start" | "center" | "end";
}

export function LanguageSwitcher({ variant = "ghost", align = "end" }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language ?? "nl").slice(0, 2) as Locale;

  const change = (lng: Locale) => {
    void i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2" aria-label={t("common.language")}>
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
