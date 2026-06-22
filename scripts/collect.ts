/* ==========================================================================
 *  Script de COLETA — roda 1x/dia (GitHub Actions), SEM seu computador ligado.
 *  Consulta a Supermetrics API (data source IGI = Instagram Insights,
 *  conta PBR Brazil) e grava os dados tratados.
 *
 *  Dois modos (automático):
 *   - Se houver Supabase configurado  -> grava no Supabase (histórico robusto).
 *   - Senão                            -> grava em lib/real-data.json
 *                                         (modo simples: o GitHub publica esse
 *                                          arquivo e a Vercel atualiza o site).
 *
 *  Rodar local:   npm run collect              (grava de verdade)
 *                 npm run collect -- --dry-run  (só imprime, não grava)
 *
 *  Variáveis (.env.local ou GitHub Secrets):
 *    SUPERMETRICS_API_KEY, SUPERMETRICS_ACCOUNT_ID, SUPERMETRICS_DS_ID
 *    (opcionais p/ modo Supabase) NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * ======================================================================== */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");

const API_KEY = process.env.SUPERMETRICS_API_KEY ?? "";
const ACCOUNT_ID = process.env.SUPERMETRICS_ACCOUNT_ID ?? "17841401478253574";
const DS_ID = process.env.SUPERMETRICS_DS_ID ?? "IGI";
const TZ = "America/Sao_Paulo";

// Endpoint oficial da Supermetrics API (Query API).
const SM_ENDPOINT = "https://api.supermetrics.com/enterprise/v2/query/data/json";

// ---------------------------------------------------------------- utilidades
function isoDateSP(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
function addDays(iso: string, days: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}
const num = (v: unknown): number => {
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// ---------------------------------------------------- chamada à Supermetrics
type Row = Record<string, string>;

/**
 * Executa uma query na Supermetrics (POST) e devolve as linhas como objetos
 * {fieldId: valor}. A resposta vem como matriz; a 1ª linha é o cabeçalho.
 * Mapeamos cada coluna pela ORDEM dos campos pedidos.
 */
async function smQuery(fields: string[], startDate: string, endDate: string): Promise<Row[]> {
  if (!API_KEY) throw new Error("SUPERMETRICS_API_KEY não definida.");

  const body = {
    ds_id: DS_ID,
    ds_accounts: ACCOUNT_ID, // string única (conta PBR Brazil)
    start_date: startDate,
    end_date: endDate,
    fields: fields.join(","), // a API espera texto separado por vírgula
    settings: { exclude_invalid_accounts: true },
    max_rows: 10000,
  };

  const res = await fetch(SM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${API_KEY}`, // chave no header (não na URL)
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supermetrics HTTP ${res.status}: ${txt.slice(0, 400)}`);
  }
  const json = (await res.json()) as any;

  const matrix: unknown[][] = json?.data?.data ?? json?.data ?? [];
  if (!Array.isArray(matrix) || matrix.length === 0) return [];
  const rows = (matrix as unknown[][]).slice(1); // remove o cabeçalho

  return rows.map((r) => {
    const obj: Row = {};
    fields.forEach((id, i) => {
      obj[id] = r[i] != null ? String(r[i]) : "";
    });
    return obj;
  });
}

function classifyType(mediaType: string, productType: string): string {
  const pt = (productType || "").toUpperCase();
  const mt = (mediaType || "").toUpperCase();
  if (pt === "REELS") return "REELS";
  if (mt === "CAROUSEL_ALBUM") return "CAROUSEL";
  if (mt === "VIDEO") return "REELS";
  return "IMAGE";
}

// ------------------------------------------------------------------- coleta
async function main() {
  const today = isoDateSP();
  console.log(`\n🐂 Coleta PBR · ${today} (TZ ${TZ})${DRY_RUN ? " · DRY-RUN" : ""}`);
  console.log(`   Conta ${ACCOUNT_ID} · data source ${DS_ID}\n`);

  // 1) Snapshot de hoje: total de seguidores, follows, media_count.
  const infoRows = await smQuery(
    ["username", "name", "followers_count", "follows_count", "media_count"],
    addDays(today, -7),
    today,
  );
  const info = infoRows[0] ?? {};
  const currentFollowers = num(info.followers_count);
  const mediaCount = num(info.media_count);
  const followsCount = num(info.follows_count);
  console.log(`   Seguidores hoje: ${currentFollowers.toLocaleString("pt-BR")}`);
  if (!currentFollowers) throw new Error("followers_count veio vazio — verifique a API key/conta.");

  // 2) Série diária (últimos 30 dias): novos seguidores, alcance, views de perfil.
  const start = addDays(today, -34);
  const dailyRows = await smQuery(["date", "follower_count", "reach", "profile_views"], start, today);
  const daily = new Map<
    string,
    { newFollowers: number | null; reach: number | null; profileViews: number | null }
  >();
  for (const r of dailyRows) {
    const date = (r.date || "").slice(0, 10);
    if (!date) continue;
    const fc = num(r.follower_count);
    daily.set(date, {
      newFollowers: fc > 0 ? fc : null, // lag: dia atual e últimos ~7 dias voltam 0/null
      reach: r.reach !== "" ? num(r.reach) : null,
      profileViews: r.profile_views !== "" ? num(r.profile_views) : null,
    });
  }
  const validGains = [...daily.values()].map((d) => d.newFollowers).filter((v): v is number => v != null);
  const recent7 = validGains.slice(-7);
  const recentPace = recent7.length ? Math.round(recent7.reduce((a, b) => a + b, 0) / recent7.length) : 0;
  console.log(`   Dias válidos: ${validGains.length} · ritmo recente ${recentPace}/dia`);

  // 3) Posts dos últimos 35 dias (inclui media_url p/ miniatura de imagens/carrosséis).
  const postRows = await smQuery(
    [
      "media_id",
      "timestamp",
      "media_type",
      "media_product_type",
      "media_permalink",
      "media_caption",
      "media_thumbnail_url",
      "media_url",
      "media_like_count",
      "media_comments_count",
      "media_views",
      "media_reach",
      "media_saved",
      "media_shares",
      "interactions",
    ],
    addDays(today, -34),
    today,
  );
  console.log(`   Posts coletados: ${postRows.length}`);

  // ---- Reconstrói os snapshots diários (totais de seguidores) ----
  const dates: string[] = [];
  for (let d = start; d <= today; d = addDays(d, 1)) dates.push(d);
  // de trás pra frente a partir de hoje; lag preenchido com o ritmo recente
  const followersByDate = new Map<string, number>();
  followersByDate.set(today, currentFollowers);
  for (let i = dates.length - 2; i >= 0; i--) {
    const next = dates[i + 1];
    const gainOnNext = daily.get(next)?.newFollowers ?? recentPace;
    followersByDate.set(dates[i], Math.round(followersByDate.get(next)! - gainOnNext));
  }

  // ---- Normaliza posts ----
  const posts = postRows
    .filter((r) => r.media_id)
    .map((r) => {
      const likes = num(r.media_like_count);
      const comments = num(r.media_comments_count);
      const saved = num(r.media_saved);
      const shares = num(r.media_shares);
      const interactions = num(r.interactions) || likes + comments + saved + shares;
      const type = classifyType(r.media_type, r.media_product_type);
      // miniatura: vídeo usa thumbnail; imagem/carrossel usa media_url
      const thumb = r.media_thumbnail_url || (type !== "REELS" ? r.media_url : "") || "";
      const ts = r.timestamp && r.timestamp.includes(" ") ? r.timestamp.replace(" ", "T") + "Z" : r.timestamp;
      return {
        mediaId: r.media_id,
        timestamp: ts,
        type,
        permalink: r.media_permalink,
        caption: r.media_caption,
        thumbnailUrl: thumb,
        likes,
        comments,
        views: num(r.media_views),
        reach: num(r.media_reach),
        saved,
        shares,
        interactions,
      };
    });

  // ---- Pacote final (camelCase, mesma forma de lib/real-data.json) ----
  const snapshots = dates.map((date) => {
    const d = daily.get(date);
    return {
      date,
      followers: date === today ? currentFollowers : followersByDate.get(date)!,
      newFollowers: d?.newFollowers ?? null,
      reach: d?.reach ?? null,
      profileViews: d?.profileViews ?? null,
    };
  });
  const pkg = {
    generatedAt: new Date().toISOString(),
    followers: { current: currentFollowers, mediaCount, followsCount },
    snapshots,
    posts,
  };

  if (DRY_RUN) {
    console.log("\n--- DRY-RUN: nada gravado ---");
    console.log("Último snapshot:", snapshots[snapshots.length - 1]);
    console.log("Exemplo de post:", posts[0]);
    return;
  }

  const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (hasSupabase) {
    await writeToSupabase(snapshots, posts, mediaCount, today);
  } else {
    // Modo simples: grava o JSON que o site lê. O GitHub Action comita isso.
    const out = path.join(process.cwd(), "lib", "real-data.json");
    fs.writeFileSync(out, JSON.stringify(pkg));
    console.log(`\n✅ Gravado em lib/real-data.json (${snapshots.length} snapshots, ${posts.length} posts).`);
  }
}

// --------------------------------------------------------- gravação Supabase
async function writeToSupabase(
  snapshots: { date: string; followers: number; newFollowers: number | null; reach: number | null; profileViews: number | null }[],
  posts: any[],
  mediaCount: number,
  today: string,
) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const snapRows = snapshots.map((s) => ({
    date: s.date,
    followers: s.followers,
    new_followers: s.newFollowers,
    reach: s.reach,
    profile_views: s.profileViews,
    media_count: s.date === today ? mediaCount : null,
  }));
  const postRows = posts.map((p) => ({
    media_id: p.mediaId,
    timestamp: p.timestamp,
    type: p.type,
    permalink: p.permalink,
    caption: p.caption,
    thumbnail_url: p.thumbnailUrl,
    likes: p.likes,
    comments: p.comments,
    views: p.views,
    reach: p.reach,
    saved: p.saved,
    shares: p.shares,
    interactions: p.interactions,
    updated_at: new Date().toISOString(),
  }));

  const e1 = (await sb.from("daily_snapshots").upsert(snapRows, { onConflict: "date" })).error;
  const e2 = postRows.length
    ? (await sb.from("posts").upsert(postRows, { onConflict: "media_id" })).error
    : null;
  if (e1 || e2) throw e1 || e2;
  console.log(`\n✅ Gravado no Supabase (${snapRows.length} snapshots, ${postRows.length} posts).`);
}

main().catch((err) => {
  console.error("\n❌ Falha na coleta:", err.message ?? err);
  process.exit(1);
});
