import { flagUrl } from "@/lib/flags";
import { useLang } from "./index";
import { DICTS, LANGUAGES } from "./locales";

export function LanguageModal() {
  const { lang, setLang } = useLang();
  if (lang) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card w-full max-w-sm rounded-xl border p-6 shadow-xl">
        <div className="label text-primary mb-1">War Era · Sverige</div>
        <h2 className="mb-1 text-lg font-semibold">{DICTS.en["lang.choose"]}</h2>
        <p className="text-muted-foreground mb-5 text-sm">{DICTS.en["lang.subtitle"]}</p>
        <div className="grid gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className="hover:border-primary/60 hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 text-left transition-colors"
            >
              <img src={flagUrl(l.country) ?? ""} alt="" className="h-5 w-7 rounded-[2px] object-cover" />
              <span className="font-medium">{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
