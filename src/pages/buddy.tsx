import { AlertTriangle, ExternalLink, Share2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { findPlayer, type Pool, type PoolPlayer, usePool } from "@/api/pool";
import { type BuddyMatch, findBuddies } from "@/features/buddy/matching";
import { ShareModal } from "@/features/buddy/share-modal";
import { UserSearch } from "@/features/search";
import { useT } from "@/i18n";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { LastSeen } from "@/shared/components/last-seen";
import { MoneyText } from "@/shared/components/money";
import { RefreshIndicator } from "@/shared/components/refresh-indicator";
import { SkillTiles } from "@/shared/components/skill-tiles";
import { UserAvatar } from "@/shared/components/user-avatar";

function profileUrl(id: string): string {
  return `https://app.warera.io/user/${id}`;
}

function BuddyStatus({ p }: { p: PoolPlayer }) {
  const t = useT();
  if (p.employerSwede) return <span className="text-chart-2 text-xs">{t("buddy.theyPaired")}</span>;
  if (p.taxPerDay > 0)
    return (
      <span className="text-destructive text-xs">
        <MoneyText>{t("buddy.theyLeak", { amount: Math.round(p.taxPerDay) })}</MoneyText>
      </span>
    );
  return <span className="text-muted-foreground text-xs">{t("buddy.theyClean")}</span>;
}

function BuddyCard({ me, match, index }: { me: PoolPlayer; match: BuddyMatch; index: number }) {
  const t = useT();
  const [shareOpen, setShareOpen] = useState(false);
  const { player, matchPct } = match;

  return (
    <li className="bg-card rise-in rounded-xl border p-3" style={{ animationDelay: `${index * 45}ms` }}>
      <div className="flex items-center gap-3">
        <UserAvatar src={player.avatar} className="size-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={profileUrl(player.id)}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm font-semibold hover:underline"
            >
              {player.username}
            </a>
            <LastSeen iso={player.lastSeen} className="shrink-0" />
          </div>
          <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <span className="text-chart-2 font-medium">{t("buddy.matchPct", { n: matchPct })}</span>
            <BuddyStatus p={player} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <Share2 className="size-3.5" />
          {t("buddy.recruit")}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <SkillTiles kind="energy" level={player.energy} size="sm" />
        <SkillTiles kind="production" level={player.production} size="sm" />
      </div>
      {shareOpen && (
        <ShareModal
          fromName={me.username}
          buddyName={player.username}
          buddyId={player.id}
          onClose={() => setShareOpen(false)}
        />
      )}
    </li>
  );
}

function HowItWorks() {
  const t = useT();
  const steps = [t("buddy.how1"), t("buddy.how2"), t("buddy.how3")];
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="label text-primary mb-2">{t("buddy.how")}</div>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={s} className="text-muted-foreground flex gap-2.5 text-sm leading-relaxed">
            <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
      <div className="bg-chart-2/10 border-chart-2/30 text-chart-2 mt-3 rounded-lg border px-3 py-2 text-sm font-medium">
        {t("buddy.benefit")}
      </div>
    </div>
  );
}

function YouCard({ me }: { me: PoolPlayer }) {
  const t = useT();
  const paired = me.employerSwede;
  const leaking = !paired && me.taxPerDay > 0;
  const tone = leaking ? "border-destructive/40 bg-destructive/5" : "border-chart-2/40 bg-chart-2/5";

  return (
    <div className={cn("rise-in rounded-xl border p-4", tone)}>
      <div className="flex items-center gap-3">
        <UserAvatar src={me.avatar} className="size-11 shrink-0 rounded-lg" />
        <div className="min-w-0">
          <a
            href={profileUrl(me.id)}
            target="_blank"
            rel="noreferrer"
            title={t("common.openProfile")}
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <span className="text-base font-semibold">{me.username}</span>
            <ExternalLink className="text-muted-foreground size-3.5" />
          </a>
          {paired ? (
            <div className="text-chart-2 flex items-center gap-1.5 text-sm font-medium">
              <ShieldCheck className="size-3.5 shrink-0" />
              {t("buddy.paired", { owner: me.employerOwner ?? "?" })}
            </div>
          ) : leaking ? (
            <div className="text-destructive flex items-center gap-1.5 text-sm font-medium">
              <AlertTriangle className="size-3.5 shrink-0" />
              <MoneyText>{t("buddy.yourLeak", { amount: Math.round(me.taxPerDay) })}</MoneyText>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">{t("buddy.noLeak")}</div>
          )}
          {leaking && me.employer && (
            <div className="text-muted-foreground text-xs">{t("buddy.yourLeakTo", { country: me.employer })}</div>
          )}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-5">
        <SkillTiles kind="energy" level={me.energy} />
        <SkillTiles kind="production" level={me.production} />
      </div>
    </div>
  );
}

function Results({ me, pool }: { me: PoolPlayer; pool: Pool }) {
  const t = useT();
  if (me.employerSwede) return <YouCard me={me} />;
  const buddies = findBuddies(me, pool);
  return (
    <div className="space-y-5">
      <YouCard me={me} />
      <HowItWorks />
      <div>
        <h2 className="bracket-heading text-sm">{t("buddy.matchesTitle")}</h2>
        <p className="text-muted-foreground mt-1 mb-3 text-xs">{t("buddy.matchesSub")}</p>
        <ul className="space-y-2">
          {buddies.map((b, i) => (
            <BuddyCard key={b.player.id} me={me} match={b} index={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function BuddyPage() {
  const { username = "" } = useParams();
  const t = useT();
  const pool = usePool();
  const addRecent = useAppStore((s) => s.addRecent);
  const me = pool.data ? findPlayer(pool.data, username) : undefined;

  useEffect(() => {
    if (me) addRecent({ username: me.username, avatarUrl: me.avatar, level: me.level });
  }, [me, addRecent]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="space-y-5">
        {pool.data && <UserSearch pool={pool.data} />}
        {pool.data && !me && (
          <p className="text-muted-foreground py-8 text-center text-sm">{t("buddy.notFound", { name: username })}</p>
        )}
        {pool.data && me && <Results me={me} pool={pool.data} />}
        {pool.data && (
          <div className="flex justify-center pt-2">
            <RefreshIndicator generatedAt={pool.data.generatedAt} />
          </div>
        )}
      </div>
    </div>
  );
}
