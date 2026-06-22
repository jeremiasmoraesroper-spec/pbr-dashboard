// ==========================================================================
//  Cálculo de todos os KPIs, do bloco META e dos dados dos gráficos.
//  Recebe os dados crus (snapshots, posts, atletas) e devolve DashboardData.
// ==========================================================================

import {
  Athlete,
  AthleteRankRow,
  DailySnapshot,
  DashboardData,
  EngagementByTypePoint,
  FollowerGrowthPoint,
  GoalStatus,
  Kpis,
  Post,
  PostsEngagementPoint,
} from "./types";
import { addDays, daysBetween, isoDateSP, monthsAndDays, shortDate } from "./format";

const GOAL_TARGET = Number(process.env.GOAL_TARGET ?? 2_000_000);
const GOAL_DATE = process.env.GOAL_DATE ?? "2026-12-31";

interface BuildInput {
  snapshots: DailySnapshot[]; // ordenados por data crescente
  posts: Post[];
  athletes: Athlete[];
  accountName: string;
  accountUsername: string;
  mediaCount: number;
  followsCount: number;
  isSeed: boolean;
}

/** Snapshot mais recente cuja data <= alvo (para "seguidores há N dias"). */
function followersOn(snapshots: DailySnapshot[], targetIso: string): number | null {
  let result: number | null = null;
  for (const s of snapshots) {
    if (s.date <= targetIso) result = s.followers;
    else break;
  }
  return result;
}

/** Soma de uma métrica diária numa janela de N dias até a última data. */
function sumWindow(
  snapshots: DailySnapshot[],
  lastDate: string,
  days: number,
  pick: (s: DailySnapshot) => number | null,
): number {
  const from = addDays(lastDate, -days + 1);
  let sum = 0;
  for (const s of snapshots) {
    if (s.date >= from && s.date <= lastDate) {
      const v = pick(s);
      if (v != null) sum += v;
    }
  }
  return sum;
}

export function buildDashboard(input: BuildInput): DashboardData {
  const { snapshots, posts, athletes } = input;
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));

  const latest = sorted[sorted.length - 1];
  const current = latest?.followers ?? 0;
  const lastDate = latest?.date ?? isoDateSP();

  // --- Lag do follower_count: último dia COM novo seguidor válido ---
  const validDays = sorted.filter((s) => s.newFollowers != null && s.newFollowers > 0);
  const followersDataUntil = validDays.length
    ? validDays[validDays.length - 1].date
    : lastDate;

  // ============================ KPIs de seguidores ========================
  const f7 = followersOn(sorted, addDays(lastDate, -7));
  const f30 = followersOn(sorted, addDays(lastDate, -30));
  const gained7 = f7 != null ? current - f7 : 0;
  const gained30 = f30 != null ? current - f30 : 0;

  const kpis: Kpis = {
    gained7d: { value: gained7, pct: f7 ? (gained7 / f7) * 100 : 0 },
    gained30d: { value: gained30, pct: f30 ? (gained30 / f30) * 100 : 0 },
    avgPerDay7d: gained7 / 7,
    avgPerDay30d: gained30 / 30,
    posts7d: 0,
    posts30d: 0,
    postsPerWeek: 0,
    engagementRate7d: 0,
    engagementRate30d: 0,
    reach7d: sumWindow(sorted, lastDate, 7, (s) => s.reach),
    reach30d: sumWindow(sorted, lastDate, 30, (s) => s.reach),
    profileViews7d: sumWindow(sorted, lastDate, 7, (s) => s.profileViews),
    profileViews30d: sumWindow(sorted, lastDate, 30, (s) => s.profileViews),
  };

  // ============================ KPIs de posts ============================
  const nowMs = Date.parse(`${lastDate}T23:59:59`);
  const within = (p: Post, days: number) =>
    Date.parse(p.timestamp) >= nowMs - days * 86_400_000;

  const posts7 = posts.filter((p) => within(p, 7));
  const posts30 = posts.filter((p) => within(p, 30));
  kpis.posts7d = posts7.length;
  kpis.posts30d = posts30.length;
  kpis.postsPerWeek = (posts30.length / 30) * 7;

  // Taxa de engajamento = (likes + comments + saved + shares) / alcance do post.
  const engRate = (list: Post[]) => {
    let interactions = 0;
    let reach = 0;
    for (const p of list) {
      interactions += p.likes + p.comments + p.saved + p.shares;
      reach += p.reach;
    }
    return reach > 0 ? (interactions / reach) * 100 : 0;
  };
  kpis.engagementRate7d = engRate(posts7);
  kpis.engagementRate30d = engRate(posts30);

  // ============================ Bloco META ===============================
  const goal = buildGoal(current, sorted, validDays);

  // ============================ Gráficos =================================
  const followerGrowth = buildGrowthChart(sorted, goal, 90);
  const postsEngagement = buildPostsEngagementChart(posts, lastDate);
  const engagementByType = buildEngagementByType(posts30);
  const bestTime = buildBestTime(posts);

  // ============================ Top posts ================================
  const byInteractions = (a: Post, b: Post) => b.interactions - a.interactions;
  const topPosts = {
    last7d: [...posts7].sort(byInteractions).slice(0, 3),
    last30d: [...posts30].sort(byInteractions).slice(0, 3),
  };

  // ===================== Competidores (últimos 15 dias) ==================
  const posts15 = posts.filter((p) => within(p, 15));
  const athleteRank = buildAthleteRanking(posts15, athletes);

  return {
    meta: {
      accountName: input.accountName,
      accountUsername: input.accountUsername,
      generatedAt: new Date().toISOString(),
      followersDataUntil,
      isSeed: input.isSeed,
    },
    followers: {
      current,
      mediaCount: input.mediaCount,
      followsCount: input.followsCount,
    },
    goal,
    kpis,
    charts: { followerGrowth, postsEngagement, engagementByType, bestTime },
    topPosts,
    athletes: athleteRank,
  };
}

// --------------------------------------------------------------------------
function buildGoal(
  current: number,
  sorted: DailySnapshot[],
  validDays: DailySnapshot[],
): GoalStatus {
  const today = isoDateSP();
  const daysLeft = Math.max(0, daysBetween(today, GOAL_DATE));
  const remaining = Math.max(0, GOAL_TARGET - current);
  const neededPerDay = daysLeft > 0 ? remaining / daysLeft : 0;

  // Ritmo recente = média dos novos seguidores nos últimos 7 dias VÁLIDOS.
  const last7valid = validDays.slice(-7);
  const currentPace = last7valid.length
    ? last7valid.reduce((a, s) => a + (s.newFollowers ?? 0), 0) / last7valid.length
    : 0;
  const last30valid = validDays.slice(-30);
  const pace30d = last30valid.length
    ? last30valid.reduce((a, s) => a + (s.newFollowers ?? 0), 0) / last30valid.length
    : 0;

  const ratio = neededPerDay > 0 ? currentPace / neededPerDay : 1;
  let status: GoalStatus["status"];
  if (ratio >= 1.05) status = "ahead";
  else if (ratio >= 1) status = "on-track";
  else if (ratio >= 0.8) status = "warning";
  else status = "behind";

  const projection = current + currentPace * daysLeft;

  return {
    target: GOAL_TARGET,
    date: GOAL_DATE,
    remaining,
    daysLeft,
    monthsLabel: monthsAndDays(daysLeft),
    neededPerDay,
    currentPace,
    pace30d,
    status,
    projection,
    projectionHitsGoal: projection >= GOAL_TARGET,
    progressPct: Math.min(100, (current / GOAL_TARGET) * 100),
  };
}

// --------------------------------------------------------------------------
function buildGrowthChart(
  sorted: DailySnapshot[],
  goal: GoalStatus,
  days: number,
): FollowerGrowthPoint[] {
  const window = sorted.slice(-days);
  if (!window.length) return [];

  // Linha ideal: do primeiro ponto da janela até a meta na data da meta (reta).
  const start = window[0];
  const startMs = Date.parse(`${start.date}T00:00:00Z`);
  const endMs = Date.parse(`${goal.date}T00:00:00Z`);
  const slope =
    endMs > startMs ? (goal.target - start.followers) / (endMs - startMs) : 0;

  return window.map((s) => {
    const ms = Date.parse(`${s.date}T00:00:00Z`);
    return {
      date: shortDate(s.date),
      followers: s.followers,
      ideal: Math.round(start.followers + slope * (ms - startMs)),
    };
  });
}

// --------------------------------------------------------------------------
function buildPostsEngagementChart(
  posts: Post[],
  lastDate: string,
): PostsEngagementPoint[] {
  // Agrupa por dia nas últimas 4 semanas (28 dias).
  const out: PostsEngagementPoint[] = [];
  const map = new Map<string, { posts: number; interactions: number }>();
  const from = addDays(lastDate, -27);
  for (const p of posts) {
    const day = p.timestamp.slice(0, 10);
    if (day < from || day > lastDate) continue;
    const cur = map.get(day) ?? { posts: 0, interactions: 0 };
    cur.posts += 1;
    cur.interactions += p.interactions;
    map.set(day, cur);
  }
  for (let i = 0; i < 28; i++) {
    const day = addDays(from, i);
    const v = map.get(day) ?? { posts: 0, interactions: 0 };
    out.push({ label: shortDate(day), posts: v.posts, interactions: v.interactions });
  }
  return out;
}

// --------------------------------------------------------------------------
const TYPE_LABEL: Record<string, string> = {
  REELS: "Reel",
  VIDEO: "Reel",
  CAROUSEL: "Carrossel",
  IMAGE: "Imagem",
};

function buildEngagementByType(posts: Post[]): EngagementByTypePoint[] {
  const agg = new Map<string, { total: number; count: number }>();
  for (const p of posts) {
    const label = TYPE_LABEL[p.type] ?? "Imagem";
    const cur = agg.get(label) ?? { total: 0, count: 0 };
    cur.total += p.interactions;
    cur.count += 1;
    agg.set(label, cur);
  }
  return ["Reel", "Carrossel", "Imagem"]
    .map((type) => {
      const v = agg.get(type) ?? { total: 0, count: 0 };
      return {
        type,
        value: v.count ? Math.round(v.total / v.count) : 0,
        count: v.count,
        total: v.total,
      };
    })
    .filter((d) => d.count > 0);
}

// --------------------------------------------------------------------------
function buildBestTime(posts: Post[]) {
  // Heatmap dia-da-semana x faixa de horário, engajamento médio.
  const cells = new Map<string, { sum: number; count: number }>();
  for (const p of posts) {
    const d = new Date(p.timestamp);
    // Usa horário de Brasília aproximado (UTC-3) p/ classificação.
    const local = new Date(Date.parse(p.timestamp) - 3 * 3600_000);
    const day = local.getUTCDay();
    const hour = local.getUTCHours();
    const key = `${day}-${hour}`;
    const cur = cells.get(key) ?? { sum: 0, count: 0 };
    cur.sum += p.interactions;
    cur.count += 1;
    cells.set(key, cur);
    void d;
  }
  return Array.from(cells.entries()).map(([key, v]) => {
    const [day, hour] = key.split("-").map(Number);
    return { day, hour, value: Math.round(v.sum / v.count), count: v.count };
  });
}

// --------------------------------------------------------------------------
function buildAthleteRanking(posts: Post[], athletes: Athlete[]): AthleteRankRow[] {
  // Sem lista cadastrada: extrai automaticamente as @menções reais das legendas
  // (parceiros, atletas e eventos que a PBR de fato marca) e ranqueia por engajamento.
  if (!athletes.length) return buildMentionRanking(posts);

  const rows: AthleteRankRow[] = athletes.map((a) => ({
    id: a.id,
    name: a.name,
    instagram: a.instagram,
    avgEngagement: 0,
    posts: 0,
    totalEngagement: 0,
  }));

  // Normaliza (minúsculas + sem acentos) para casar "Ednélio" com "ednelio" etc.
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  // Pré-calcula os termos de busca de cada atleta (@handle, hashtags, nome completo).
  const athleteTerms = athletes.map((a) => {
    const terms: string[] = [];
    const handle = norm(a.instagram.replace("@", ""));
    if (handle.length >= 3) terms.push(handle);
    for (const h of a.hashtags) terms.push(norm(h));
    const nameParts = norm(a.name).split(" ").filter(Boolean);
    if (nameParts.length >= 2) terms.push(nameParts.join(" ")); // nome completo
    return terms.filter((t) => t.length >= 4);
  });

  for (const post of posts) {
    const caption = norm(post.caption);
    for (let i = 0; i < athletes.length; i++) {
      const hit = athleteTerms[i].some((t) => caption.includes(t));
      if (hit) {
        rows[i].posts += 1;
        rows[i].totalEngagement += post.interactions;
      }
    }
  }

  for (const r of rows) {
    r.avgEngagement = r.posts ? Math.round(r.totalEngagement / r.posts) : 0;
  }
  return rows
    .filter((r) => r.posts > 0)
    .sort((a, b) => b.totalEngagement - a.totalEngagement);
}

/** Ranking automático por @menção real nas legendas, ordenado por engajamento total. */
function buildMentionRanking(posts: Post[]): AthleteRankRow[] {
  const agg = new Map<string, { posts: number; total: number }>();
  for (const post of posts) {
    // @handles únicos por post (evita contar 2x a mesma menção no mesmo post).
    const handles = new Set(
      (post.caption.match(/@[a-zA-Z0-9_.]+/g) ?? [])
        .map((h) => h.toLowerCase().replace(/\.+$/, "")) // tira ponto final solto
        .filter((h) => h.length > 3),
    );
    for (const h of handles) {
      const cur = agg.get(h) ?? { posts: 0, total: 0 };
      cur.posts += 1;
      cur.total += post.interactions;
      agg.set(h, cur);
    }
  }
  return Array.from(agg.entries())
    .map(([handle, v]) => ({
      id: handle,
      name: handle.replace("@", ""),
      instagram: handle,
      posts: v.posts,
      totalEngagement: v.total,
      avgEngagement: Math.round(v.total / v.posts),
    }))
    .sort((a, b) => b.totalEngagement - a.totalEngagement);
}
