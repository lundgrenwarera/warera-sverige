import { Coins, Users } from "lucide-react";
import { type Pool, usePool } from "@/api/pool";
import { RecentList, UserSearch } from "@/features/search";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { MoneyText } from "@/shared/components/money";
import { RefreshIndicator } from "@/shared/components/refresh-indicator";

function fmt(n: number): string {
  return new Intl.NumberFormat("en").format(Math.round(n));
}

function PoolStats({ pool }: { pool: Pool }) {
  const t = useT();
  const funding = pool.players.filter((p) => p.enemy).length;
  const tax = pool.players.reduce((s, p) => s + (p.enemy ? p.taxPerDay : 0), 0);
  const items = [
    { value: fmt(pool.count), label: t("landing.statPlayers"), tone: "" },
    { value: fmt(funding), label: t("landing.statFunding"), tone: "text-destructive" },
    { value: `$${fmt(tax)}`, label: t("landing.statTax"), tone: "text-destructive" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.label} className="bg-card rounded-xl border p-3 text-center">
          <div className={cn("font-mono text-xl font-semibold tabular-nums", it.tone)}>
            <MoneyText>{it.value}</MoneyText>
          </div>
          <div className="text-muted-foreground mt-0.5 text-[11px] leading-tight">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  const t = useT();
  const pool = usePool();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-8 rise-in">
        <div className="text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex size-12 items-center justify-center rounded-xl">
            <Coins className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("landing.heading")}</h1>
          <div className="text-primary mt-1 font-mono text-[11px] tracking-[0.22em] uppercase">{t("brand.motto")}</div>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">{t("landing.sub")}</p>
        </div>

        {pool.data ? (
          <>
            <PoolStats pool={pool.data} />
            <div className="space-y-3">
              <UserSearch pool={pool.data} />
              <RecentList />
            </div>

            <div className="bg-card flex items-start gap-3 rounded-xl border p-4">
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Users className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{t("tool.buddy.name")}</div>
                <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">{t("tool.buddy.desc")}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <RefreshIndicator generatedAt={pool.data.generatedAt} />
            </div>
          </>
        ) : pool.isError ? (
          <p className="text-destructive text-center text-sm">Couldn't load the Sweden player pool.</p>
        ) : (
          <p className="text-muted-foreground text-center text-sm">Loading…</p>
        )}
      </div>
    </div>
  );
}
