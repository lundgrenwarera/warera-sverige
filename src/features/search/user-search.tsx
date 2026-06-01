import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Pool, type PoolPlayer, searchPlayers } from "@/api/pool";
import { useT } from "@/i18n";
import { UserAvatar } from "@/shared/components/user-avatar";
import { Input } from "@/ui/input";

export function UserSearch({ pool }: { pool: Pool }) {
  const navigate = useNavigate();
  const t = useT();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const results = searchPlayers(pool, value);
  const go = (p: PoolPlayer) => navigate(`/buddy/${encodeURIComponent(p.username)}`);

  const showDropdown = open && value.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) go(results[0]);
        }}
      >
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t("buddy.searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </form>

      {showDropdown && (
        <div className="bg-popover absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border shadow-xl">
          {results.length === 0 && <div className="text-muted-foreground p-3 text-sm">—</div>}
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => go(r)}
              className="hover:bg-accent flex w-full items-center gap-3 p-2.5 text-left transition-colors"
            >
              <UserAvatar src={r.avatar} className="size-9 shrink-0 rounded-lg" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{r.username}</div>
                {r.level != null && (
                  <div className="text-muted-foreground truncate text-xs">{t("common.level", { n: r.level })}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
