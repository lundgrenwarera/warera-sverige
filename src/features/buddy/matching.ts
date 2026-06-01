import type { Pool, PoolPlayer } from "@/api/pool";

export interface BuddyMatch {
  player: PoolPlayer;
  matchPct: number;
}

const SKILL_MAX = 15;

export function matchPercent(a: PoolPlayer, b: PoolPlayer): number {
  const de = Math.abs(a.energy - b.energy) / SKILL_MAX;
  const dp = Math.abs(a.production - b.production) / SKILL_MAX;
  return Math.round(Math.max(0, 1 - (de + dp) / 2) * 100);
}

function lastSeenMs(p: PoolPlayer): number {
  return p.lastSeen ? new Date(p.lastSeen).getTime() : 0;
}

export function findBuddies(me: PoolPlayer, pool: Pool, limit = 6): BuddyMatch[] {
  return pool.players
    .filter((p) => p.id !== me.id && !p.employerSwede)
    .map((player) => ({ player, matchPct: matchPercent(me, player) }))
    .sort((a, b) => {
      if (b.matchPct !== a.matchPct) return b.matchPct - a.matchPct;
      const act = lastSeenMs(b.player) - lastSeenMs(a.player);
      if (act !== 0) return act;
      return b.player.taxPerDay - a.player.taxPerDay;
    })
    .slice(0, limit);
}
