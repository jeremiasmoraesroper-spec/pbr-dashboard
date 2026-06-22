// ==========================================================================
//  Gerador de DADOS DE EXEMPLO (seed) — determinístico.
//  Base real: 1.735.018 seguidores em 22/06/2026, ritmo ~1.400–2.000/dia.
//  Serve para visualizar o dashboard ANTES de conectar a Supermetrics.
// ==========================================================================

import { Athlete, DailySnapshot, MediaType, Post } from "./types";
import { addDays, isoDateSP } from "./format";

const ANCHOR_DATE = "2026-06-22";
const ANCHOR_FOLLOWERS = 1_735_018;
const HISTORY_DAYS = 130; // dias de histórico no gráfico/seed
const LAG_DAYS = 8; // follower_count atrasa ~7-8 dias -> últimos dias = null

/** RNG determinístico (mulberry32) — mesma saída sempre. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --------------------------------------------------------------------------
//  Atletas/peões da PBR Brasil para o ranking de engajamento.
//  Edite livremente (nome, @ e hashtags) — o sistema cruza com a legenda.
// --------------------------------------------------------------------------
export const SEED_ATHLETES: Athlete[] = [
  { id: "jvl", name: "José Vitor Leme", instagram: "@josevitorleme", hashtags: ["jvl", "josevitorleme"] },
  { id: "kaique", name: "Kaique Pacheco", instagram: "@kaiquepacheco", hashtags: ["kaiquepacheco"] },
  { id: "rafael", name: "Rafael José", instagram: "@rafaeljose", hashtags: ["rafaeljose"] },
  { id: "dener", name: "Dener Barbosa", instagram: "@denerbarbosa", hashtags: ["denerbarbosa"] },
  { id: "cassio", name: "Cássio Dias", instagram: "@cassiodias", hashtags: ["cassiodias"] },
  { id: "wingson", name: "Wingson Henrique", instagram: "@wingsonhenrique", hashtags: ["wingson"] },
  { id: "leonardo", name: "Leonardo Castro", instagram: "@leonardocastro", hashtags: ["leonardocastro"] },
  { id: "joaoricardo", name: "João Ricardo Vieira", instagram: "@joaoricardovieira", hashtags: ["joaoricardo"] },
];

const ATHLETE_TAGS = SEED_ATHLETES.map((a) => ({ handle: a.instagram, name: a.name }));

const CAPTION_BASES = [
  "Que ride! 🐂🔥 Nota máxima do",
  "8 segundos de pura adrenalina com",
  "Aquela montaria histórica do",
  "Reta final da temporada e o",
  "Domingo de PBR Brasil! Show do",
  "Bastidores da arena com",
  "Top 5 da rodada — destaque pra",
  "A torcida foi à loucura com",
];

const TYPES: { type: MediaType; weight: number }[] = [
  { type: "REELS", weight: 0.55 },
  { type: "CAROUSEL", weight: 0.3 },
  { type: "IMAGE", weight: 0.15 },
];

function pickType(r: number): MediaType {
  let acc = 0;
  for (const t of TYPES) {
    acc += t.weight;
    if (r <= acc) return t.type;
  }
  return "IMAGE";
}

/** Código curto estilo Instagram (determinístico). */
function shortcode(n: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
  let s = "";
  let x = n * 2654435761;
  for (let i = 0; i < 9; i++) {
    s += chars[Math.abs(x) % chars.length];
    x = Math.floor(x / chars.length) + 7;
  }
  return "C" + s;
}

// --------------------------------------------------------------------------
export function buildSeedSnapshots(): DailySnapshot[] {
  const today = isoDateSP();
  // Garante que o seed termina hoje (>= âncora), pra parecer sempre atual.
  const end = today > ANCHOR_DATE ? today : ANCHOR_DATE;

  const dates: string[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) dates.push(addDays(end, -i));

  // Gera os ganhos diários (novos seguidores) determinísticos.
  const r = rng(20260622);
  const gains: number[] = dates.map((_, i) => {
    // Tendência levemente crescente + ondas semanais + ruído. Faixa ~1300-2200.
    const weekday = i % 7;
    const weekendBoost = weekday === 5 || weekday === 6 ? 350 : 0; // fim de semana puxa
    const base = 1500 + (i / HISTORY_DAYS) * 250; // tendência
    const wave = Math.sin(i / 4) * 180;
    const noise = (r() - 0.5) * 500;
    return Math.max(900, Math.round(base + wave + noise + weekendBoost));
  });

  // Posiciona a âncora: followers[anchorIdx] = ANCHOR_FOLLOWERS.
  const anchorIdx = Math.max(0, dates.indexOf(ANCHOR_DATE));
  const followers: number[] = new Array(dates.length);
  followers[anchorIdx] = ANCHOR_FOLLOWERS;
  for (let i = anchorIdx + 1; i < dates.length; i++) followers[i] = followers[i - 1] + gains[i];
  for (let i = anchorIdx - 1; i >= 0; i--) followers[i] = followers[i + 1] - gains[i + 1];

  const lagStart = dates.length - LAG_DAYS;
  return dates.map((date, i) => {
    const reachBase = 380_000 + (r() - 0.4) * 220_000 + (i % 7 >= 5 ? 120_000 : 0);
    const reach = Math.round(Math.max(120_000, reachBase));
    return {
      date,
      followers: followers[i],
      // Lag: os últimos LAG_DAYS dias voltam sem dado válido (null).
      newFollowers: i >= lagStart ? null : gains[i],
      reach,
      profileViews: Math.round(reach * (0.02 + r() * 0.02)),
    };
  });
}

// --------------------------------------------------------------------------
export function buildSeedPosts(): Post[] {
  const today = isoDateSP();
  const end = today > ANCHOR_DATE ? today : ANCHOR_DATE;
  const r = rng(77);
  const posts: Post[] = [];

  // ~5 posts por semana nos últimos 45 dias.
  let id = 1000;
  for (let day = 44; day >= 0; day--) {
    const date = addDays(end, -day);
    const postsToday = r() < 0.72 ? (r() < 0.35 ? 2 : 1) : 0;
    for (let k = 0; k < postsToday; k++) {
      id++;
      const type = pickType(r());
      const hour = 9 + Math.floor(r() * 13); // entre 9h e 22h
      const minute = Math.floor(r() * 60);
      const timestamp = `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-03:00`;

      // Engajamento por tipo: Reels rendem mais.
      const reach =
        type === "REELS"
          ? 600_000 + r() * 1_400_000
          : type === "CAROUSEL"
            ? 250_000 + r() * 500_000
            : 150_000 + r() * 300_000;
      const engBase = reach * (0.03 + r() * 0.05);
      const likes = Math.round(engBase * (0.78 + r() * 0.1));
      const comments = Math.round(engBase * (0.05 + r() * 0.03));
      const saved = Math.round(engBase * (0.08 + r() * 0.04));
      const shares = Math.round(engBase * (0.06 + r() * 0.05));
      const views = type === "REELS" ? Math.round(reach * (1.2 + r() * 1.5)) : Math.round(reach * 0.4);
      const interactions = likes + comments + saved + shares;

      // Legenda: às vezes menciona 1-2 atletas (pra alimentar o ranking).
      const mention = r();
      let athletes = "";
      if (mention < 0.75) {
        const a = ATHLETE_TAGS[Math.floor(r() * ATHLETE_TAGS.length)];
        athletes = ` ${a.name} ${a.handle}`;
        if (r() < 0.25) {
          const b = ATHLETE_TAGS[Math.floor(r() * ATHLETE_TAGS.length)];
          athletes += ` e ${b.name} ${b.handle}`;
        }
      }
      const base = CAPTION_BASES[Math.floor(r() * CAPTION_BASES.length)];
      const caption = `${base}${athletes}! #PBRBrasil #montaria #touros #rodeio`;

      posts.push({
        mediaId: String(id),
        timestamp,
        type,
        permalink: `https://www.instagram.com/p/${shortcode(id)}/`,
        caption,
        thumbnailUrl: `https://picsum.photos/seed/pbr${id}/600/600`,
        likes,
        comments,
        views,
        reach: Math.round(reach),
        saved,
        shares,
        interactions,
      });
    }
  }
  return posts;
}
