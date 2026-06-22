"use client";

import { compact } from "@/lib/format";
import { Post } from "@/lib/types";

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  REELS: { label: "Reel", cls: "bg-gold/20 text-gold" },
  VIDEO: { label: "Reel", cls: "bg-gold/20 text-gold" },
  CAROUSEL: { label: "Carrossel", cls: "bg-good/20 text-good" },
  IMAGE: { label: "Imagem", cls: "bg-sky-500/20 text-sky-300" },
};

export default function TopPosts({ posts }: { posts: Post[] }) {
  return (
    <div className="card flex h-full flex-col p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white/70 xl:text-base">
          Top conteúdo
        </h3>
        <span className="text-xs text-white/45">últimos 7 dias</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
        {posts.length === 0 && (
          <div className="col-span-3 flex items-center justify-center text-sm text-white/40">
            Sem posts no período
          </div>
        )}
        {posts.map((p, i) => {
          const badge = TYPE_BADGE[p.type] ?? TYPE_BADGE.IMAGE;
          return (
            <a
              key={p.mediaId}
              href={p.permalink}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-ink-600 to-ink-800"
            >
              {p.thumbnailUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:opacity-90"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-5xl font-bold text-white/5">PBR</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
              <div className="absolute left-2 top-2 flex items-center gap-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-black">
                  {i + 1}
                </span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <div className="tabular font-display text-2xl font-bold text-white">
                  {compact(p.interactions)}
                </div>
                <div className="flex gap-2 text-[10px] text-white/70">
                  <span>❤ {compact(p.likes)}</span>
                  <span>💬 {compact(p.comments)}</span>
                  <span>↗ {compact(p.shares)}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
