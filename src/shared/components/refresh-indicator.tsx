import { RefreshCw } from "lucide-react";
import { useLang } from "@/i18n";

function relative(t: (k: "time.now" | "time.min" | "time.hour", v?: Record<string, number>) => string, iso: string) {
  const then = new Date(iso).getTime();
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return t("time.now");
  if (mins < 60) return t("time.min", { n: mins });
  return t("time.hour", { n: Math.round(mins / 60) });
}

export function RefreshIndicator({ generatedAt }: { generatedAt: string }) {
  const { t } = useLang();
  return (
    <div className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
      <RefreshCw className="size-3" />
      <span>{t("refresh.updated", { when: relative(t, generatedAt) })}</span>
      <span className="opacity-60">· {t("refresh.hourly")}</span>
    </div>
  );
}
