/* ==========================================================================
 *  Popula o Supabase com os DADOS DE EXEMPLO (seed).
 *  Útil para testar o banco + dashboard com dados reais antes de plugar a API.
 *  Rodar: npm run seed:db
 * ======================================================================== */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { buildSeedPosts, buildSeedSnapshots, SEED_ATHLETES } from "../lib/seed";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const snapshots = buildSeedSnapshots().map((s) => ({
    date: s.date,
    followers: s.followers,
    new_followers: s.newFollowers,
    reach: s.reach,
    profile_views: s.profileViews,
    media_count: null,
  }));
  const posts = buildSeedPosts().map((p) => ({
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
  const athletes = SEED_ATHLETES.map((a) => ({
    id: a.id,
    name: a.name,
    instagram: a.instagram,
    hashtags: a.hashtags,
  }));

  const e1 = (await sb.from("athletes").upsert(athletes, { onConflict: "id" })).error;
  const e2 = (await sb.from("daily_snapshots").upsert(snapshots, { onConflict: "date" })).error;
  const e3 = (await sb.from("posts").upsert(posts, { onConflict: "media_id" })).error;
  if (e1 || e2 || e3) throw e1 || e2 || e3;

  console.log(`✅ Seed gravado: ${snapshots.length} snapshots, ${posts.length} posts, ${athletes.length} atletas.`);
}

main().catch((err) => {
  console.error("❌ Erro:", err.message ?? err);
  process.exit(1);
});
