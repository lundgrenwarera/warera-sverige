import { Clock } from "lucide-react";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

function relative(t: ReturnType<typeof useT>, iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return t("time.now");
  if (mins < 60) return t("time.min", { n: mins });
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return t("time.hour", { n: hrs });
  return t("time.day", { n: Math.round(hrs / 24) });
}

export function LastSeen({ iso, className }: { iso: string | null; className?: string }) {
  const t = useT();
  if (!iso) return null;
  return (
    <span className={cn("text-muted-foreground inline-flex items-center gap-1 text-xs", className)}>
      <Clock className="size-3" />
      {t("common.lastOnline", { when: relative(t, iso) })}
    </span>
  );
}
