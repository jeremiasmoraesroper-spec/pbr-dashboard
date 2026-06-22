// ==========================================================================
//  Resolvedor de dados (server-side).
//  Tenta ler do Supabase; se não estiver configurado OU vier vazio,
//  cai automaticamente nos DADOS DE EXEMPLO (seed). Sempre devolve um
//  DashboardData pronto para o frontend.
// ==========================================================================

import { buildDashboard } from "./metrics";
import { buildSeedPosts, buildSeedSnapshots, SEED_ATHLETES } from "./seed";
import { getReadClient, hasSupabase } from "./supabase";
import { Athlete, DailySnapshot, DashboardData, Post } from "./types";
import { COMPETITORS } from "./competitors";
import realData from "./real-data.json";

const ACCOUNT_NAME = "PBR Brazil";
const ACCOUNT_USERNAME = "pbrbrazil";

function buildFromSeed(): DashboardData {
  const snapshots = buildSeedSnapshots();
  const posts = buildSeedPosts();
  return buildDashboard({
    snapshots,
    posts,
    athletes: SEED_ATHLETES,
    accountName: ACCOUNT_NAME,
    accountUsername: ACCOUNT_USERNAME,
    mediaCount: 4200 + posts.length,
    followsCount: 18,
    isSeed: true,
  });
}

/**
 * Dados REAIS da PBR Brazil (snapshot da Supermetrics gravado em lib/real-data.json).
 * Usado quando o Supabase ainda não está conectado. O ranking de menções é
 * extraído automaticamente das legendas reais (sem lista de atletas inventada).
 */
function buildFromReal(): DashboardData {
  const snapshots = realData.snapshots as DailySnapshot[];
  const posts = realData.posts as Post[];
  const data = buildDashboard({
    snapshots,
    posts,
    athletes: COMPETITORS, // ranking de competidores cruzado com as legendas
    accountName: ACCOUNT_NAME,
    accountUsername: ACCOUNT_USERNAME,
    mediaCount: realData.followers.mediaCount,
    followsCount: realData.followers.followsCount,
    isSeed: false,
  });
  data.meta.generatedAt = realData.generatedAt;
  return data;
}

export async function getDashboardData(): Promise<DashboardData> {
  // Sem Supabase: usa o snapshot REAL (não o seed inventado).
  if (!hasSupabase()) {
    return realData?.posts?.length ? buildFromReal() : buildFromSeed();
  }

  try {
    const sb = getReadClient();

    const [snapRes, postRes, athRes] = await Promise.all([
      sb.from("daily_snapshots").select("*").order("date", { ascending: true }),
      sb.from("posts").select("*").order("timestamp", { ascending: false }).limit(500),
      sb.from("athletes").select("*"),
    ]);

    const snapshots: DailySnapshot[] = (snapRes.data ?? []).map((r: any) => ({
      date: r.date,
      followers: r.followers,
      newFollowers: r.new_followers,
      reach: r.reach,
      profileViews: r.profile_views,
    }));

    // Sem histórico ainda? Mostra o seed para não deixar a TV vazia.
    if (snapshots.length === 0) return buildFromSeed();

    const posts: Post[] = (postRes.data ?? []).map((r: any) => ({
      mediaId: r.media_id,
      timestamp: r.timestamp,
      type: r.type,
      permalink: r.permalink,
      caption: r.caption ?? "",
      thumbnailUrl: r.thumbnail_url ?? "",
      likes: r.likes ?? 0,
      comments: r.comments ?? 0,
      views: r.views ?? 0,
      reach: r.reach ?? 0,
      saved: r.saved ?? 0,
      shares: r.shares ?? 0,
      interactions: r.interactions ?? 0,
    }));

    const athletes: Athlete[] = (athRes.data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      instagram: r.instagram,
      hashtags: r.hashtags ?? [],
    }));

    const latest = snapshots[snapshots.length - 1];
    return buildDashboard({
      snapshots,
      posts,
      // Usa a tabela 'athletes' do Supabase; se vazia, cai na lista de competidores.
      athletes: athletes.length ? athletes : COMPETITORS,
      accountName: ACCOUNT_NAME,
      accountUsername: ACCOUNT_USERNAME,
      mediaCount: latest ? (latest as any).media_count ?? posts.length : posts.length,
      followsCount: realData.followers.followsCount,
      isSeed: false,
    });
  } catch (err) {
    // Qualquer falha de leitura -> não deixa a TV cair; usa o snapshot real.
    console.error("Falha ao ler Supabase, usando snapshot real:", err);
    return buildFromReal();
  }
}
