import { Link } from "react-router-dom";
import { flagUrl } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n";
import { LANGUAGES } from "@/i18n/locales";

function LanguageSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-label={l.label}
          className={cn(
            "rounded-md p-1 transition-opacity",
            lang === l.code ? "opacity-100 ring-1 ring-primary/60" : "opacity-50 hover:opacity-100",
          )}
        >
          <img src={flagUrl(l.country) ?? ""} alt={l.label} className="h-4 w-6 rounded-[2px] object-cover" />
        </button>
      ))}
    </div>
  );
}

export function TopBar() {
  const { t } = useLang();
  return (
    <header className="border-border bg-background/95 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="leading-none">
          <div className="label text-primary">{t("brand.warera")}</div>
          <div className="bracket-heading text-foreground text-sm">{t("brand.sverige")}</div>
        </Link>
        <LanguageSwitch />
      </div>
    </header>
  );
}
