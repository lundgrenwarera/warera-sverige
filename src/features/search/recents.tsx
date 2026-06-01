import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "@/i18n";
import { type RecentEntry, useAppStore } from "@/lib/store";
import { UserAvatar } from "@/shared/components/user-avatar";

function RecentCard({ entry }: { entry: RecentEntry }) {
  const removeRecent = useAppStore((s) => s.removeRecent);
  const t = useT();
  return (
    <div className="group relative">
      <Link
        to={`/buddy/${encodeURIComponent(entry.username)}`}
        className="bg-card hover:border-primary/50 flex items-center gap-3 rounded-xl border p-2.5 transition-colors"
      >
        <UserAvatar src={entry.avatarUrl} className="size-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <span className="truncate text-sm font-semibold">{entry.username}</span>
          {entry.level != null && (
            <div className="text-muted-foreground text-xs">{t("common.level", { n: entry.level })}</div>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => removeRecent(entry.username)}
        aria-label={`Remove ${entry.username}`}
        className="text-muted-foreground hover:text-foreground absolute top-1.5 right-1.5 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function RecentList() {
  const recents = useAppStore((s) => s.recents);
  if (recents.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {recents.map((r) => (
          <RecentCard key={r.username} entry={r} />
        ))}
      </div>
    </div>
  );
}
