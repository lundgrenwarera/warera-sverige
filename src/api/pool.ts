import { useQuery } from "@tanstack/react-query";

export interface PoolPlayer {
  id: string;
  username: string;
  avatar: string | null;
  level: number | null;
  energy: number;
  production: number;
  works: number;
  lastSeen: string | null;
  employer: string | null;
  enemy: boolean;
  taxPerDay: number;
  employerSwede: boolean;
  employerOwner: string | null;
}

export interface Pool {
  country: string;
  count: number;
  generatedAt: string;
  refreshIntervalMin: number;
  players: PoolPlayer[];
}

async function fetchPool(): Promise<Pool> {
  const res = await fetch(`${import.meta.env.BASE_URL}sweden.json`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to load player pool (${res.status})`);
  return (await res.json()) as Pool;
}

export function usePool() {
  return useQuery({ queryKey: ["pool"], queryFn: fetchPool });
}

export function findPlayer(pool: Pool, username: string): PoolPlayer | undefined {
  const q = username.trim().toLowerCase();
  return pool.players.find((p) => p.username.toLowerCase() === q);
}

export function searchPlayers(pool: Pool, query: string, limit = 6): PoolPlayer[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const starts: PoolPlayer[] = [];
  const includes: PoolPlayer[] = [];
  for (const p of pool.players) {
    const u = p.username.toLowerCase();
    if (u.startsWith(q)) starts.push(p);
    else if (u.includes(q)) includes.push(p);
    if (starts.length >= limit) break;
  }
  return [...starts, ...includes].slice(0, limit);
}
