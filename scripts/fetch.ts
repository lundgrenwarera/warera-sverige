import { writeFileSync } from "node:fs";

const BASE = "https://gateway.warerastats.io/trpc";
const API_KEY = process.env.WARERA_API_KEY ?? "";
const SWEDEN = "6813b6d446e731854c7ac7f2";
const ICDP = new Set([
  "Sweden",
  "Germany",
  "Serbia",
  "Portugal",
  "Brazil",
  "Bolivia",
  "Indonesia",
  "Romania",
  "Spain",
  "Ukraine",
]);
const WAGE_PER_PP = 0.13;
const CONCURRENCY = 32;
const MIN_PLAYERS = 300;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MIN_INTERVAL_MS = Number(process.env.INTERVAL ?? 160);
let nextSlot = 0;

async function gate(): Promise<void> {
  const slot = Math.max(Date.now(), nextSlot);
  nextSlot = slot + MIN_INTERVAL_MS;
  const wait = slot - Date.now();
  if (wait > 0) await sleep(wait);
}

const stats = { req: 0, r429: 0, err: 0, t0: Date.now() };

async function trpc<T>(proc: string, input: Record<string, unknown>, attempt = 0): Promise<T> {
  await gate();
  const url = `${BASE}/${proc}?input=${encodeURIComponent(JSON.stringify(input))}`;
  stats.req++;
  let text: string;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "X-API-Key": API_KEY, "User-Agent": "warera-sverige" },
      signal: AbortSignal.timeout(15000),
    });
    text = await res.text();
  } catch (e) {
    if (attempt < 8) {
      stats.r429++;
      await sleep(1500 * (attempt + 1));
      return trpc(proc, input, attempt + 1);
    }
    throw e;
  }
  // gateway wraps rate-limit as a tRPC error body, so detect it in the text
  if (/Rate limit|429:/.test(text) && attempt < 8) {
    stats.r429++;
    await sleep(2000 * (attempt + 1));
    return trpc(proc, input, attempt + 1);
  }
  const body = JSON.parse(text) as { result?: { data?: T }; error?: { message?: string } };
  if (body.error) throw new Error(`${proc}: ${body.error.message}`);
  if (!body.result || body.result.data === undefined) throw new Error(`${proc} no data`);
  return body.result.data;
}

async function settle<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    stats.err++;
    return null;
  }
}

async function listSwedes(): Promise<string[]> {
  const ids: string[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 500; i++) {
    const input: Record<string, unknown> = { countryId: SWEDEN };
    if (cursor) input.cursor = cursor;
    const data = await trpc<{ items?: { _id: string }[]; nextCursor?: string | null }>("user.getUsersByCountry", input);
    const items = data.items ?? [];
    for (const it of items) ids.push(it._id);
    if (!data.nextCursor || items.length === 0) break;
    cursor = data.nextCursor;
  }
  return ids;
}

interface RawUser {
  username?: string;
  avatarUrl?: string;
  company?: string | null;
  leveling?: { level?: number };
  skills?: Record<string, { level?: number; total?: number; hourlyBarRegen?: number }>;
  stats?: { worksCount?: number };
  dates?: { lastConnectionAt?: string };
}

const countryCache = new Map<string, { name: string; income: number }>();
const regionCountry = new Map<string, string>();

const ownerCache = new Map<string, { swede: boolean; name: string | null }>();

interface EmployerInfo {
  name: string;
  income: number;
  ownerSwede: boolean;
  ownerName: string | null;
}

async function employerInfo(companyId: string): Promise<EmployerInfo | null> {
  const c = await settle(trpc<{ region?: string; user?: string }>("company.getById", { companyId }));
  if (!c?.region) return null;
  let countryId = regionCountry.get(c.region);
  if (!countryId) {
    const r = await settle(trpc<{ country?: string }>("region.getById", { regionId: c.region }));
    if (!r?.country) return null;
    countryId = r.country;
    regionCountry.set(c.region, countryId);
  }
  let meta = countryCache.get(countryId);
  if (!meta) {
    const cc = await settle(trpc<{ name?: string; taxes?: { income?: number } }>("country.getCountryById", { countryId }));
    meta = { name: cc?.name ?? "Unknown", income: cc?.taxes?.income ?? 0 };
    countryCache.set(countryId, meta);
  }
  let owner = { swede: false, name: null as string | null };
  if (c.user) {
    let o = ownerCache.get(c.user);
    if (!o) {
      const ou = await settle(trpc<{ username?: string; country?: string }>("user.getUserById", { userId: c.user }));
      o = { swede: ou?.country === SWEDEN, name: ou?.username ?? null };
      ownerCache.set(c.user, o);
    }
    owner = o;
  }
  return { name: meta.name, income: meta.income, ownerSwede: owner.swede, ownerName: owner.name };
}

interface PoolPlayer {
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

async function buildPlayer(id: string): Promise<PoolPlayer | null> {
  const u = await settle(trpc<RawUser>("user.getUserById", { userId: id }));
  if (!u?.skills) return null;
  const energy = u.skills.energy?.level;
  const production = u.skills.production?.level;
  if (energy == null || production == null) return null;

  let employer: string | null = null;
  let enemy = false;
  let taxPerDay = 0;
  let employerSwede = false;
  let employerOwner: string | null = null;
  if (u.company) {
    const dest = await employerInfo(u.company);
    if (dest) {
      employerSwede = dest.ownerSwede;
      employerOwner = dest.ownerName;
      if (dest.name !== "Sweden") {
        const pp = u.skills.production?.total ?? 10;
        const worksPerDay = ((u.skills.energy?.hourlyBarRegen ?? 4) * 24) / 10;
        const dailyWage = pp * worksPerDay * WAGE_PER_PP;
        employer = dest.name;
        enemy = !ICDP.has(dest.name);
        taxPerDay = Math.round(dailyWage * (dest.income / 100) * 100) / 100;
      }
    }
  }

  return {
    id,
    username: u.username ?? id,
    avatar: u.avatarUrl ?? null,
    level: u.leveling?.level ?? null,
    energy,
    production,
    works: u.stats?.worksCount ?? 0,
    lastSeen: u.dates?.lastConnectionAt ?? null,
    employer,
    enemy,
    taxPerDay,
    employerSwede,
    employerOwner,
  };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let i = 0;
  let done = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
      done++;
      if (done % 50 === 0) {
        const s = ((Date.now() - stats.t0) / 1000).toFixed(0);
        console.log(`  ${done}/${items.length} done · ${stats.req} reqs · ${stats.r429} 429 · ${stats.err} err · ${s}s`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function main() {
  if (!API_KEY) {
    console.error("Set WARERA_API_KEY (the warerastats gateway API key) before running.");
    process.exit(1);
  }
  console.log("listing Swedish players…");
  const ids = await listSwedes();
  console.log(`${ids.length} players, fetching details…`);
  const players = (await mapLimit(ids, CONCURRENCY, buildPlayer)).filter((p): p is PoolPlayer => p !== null);
  players.sort((a, b) => b.taxPerDay - a.taxPerDay);

  if (players.length < MIN_PLAYERS) {
    console.error(`Only ${players.length} players fetched (< ${MIN_PLAYERS}, likely rate-limited). Keeping existing pool.`);
    process.exit(0);
  }

  const pool = {
    country: "Sweden",
    count: players.length,
    generatedAt: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
    refreshIntervalMin: 60,
    players,
  };
  writeFileSync("public/sweden.json", JSON.stringify(pool));
  console.log(`wrote public/sweden.json — ${players.length} players, ${players.filter((p) => p.enemy).length} funding enemies`);
  console.log(`stats: ${stats.req} reqs · ${stats.r429} 429 · ${stats.err} err · ${((Date.now() - stats.t0) / 1000).toFixed(0)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
