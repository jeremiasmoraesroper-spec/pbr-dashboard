"use client";

import { compact } from "@/lib/format";
import { AthleteRankRow } from "@/lib/types";

export default function AthleteRanking({ rows }: { rows: AthleteRankRow[] }) {
  const top = rows.slice(0, 6);
  const max = Math.max(1, ...top.map((r) => r.totalEngagement));

  return (
    <div className="card flex h-full flex-col p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white/70 xl:text-base">
          Competidores que mais engajam
        </h3>
        <span className="text-xs text-white/45">eng. total · 15 dias</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-around gap-1.5">
        {top.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-sm text-white/40">
            Nenhum competidor marcado nos posts dos últimos 15 dias
          </div>
        )}
        {top.map((r, i) => (
          <div key={r.id} className="flex items-center gap-2">
            <span className="w-4 text-right text-xs font-bold text-white/35">{i + 1}</span>
            <div className="w-28 shrink-0 truncate xl:w-36">
              <div className="truncate text-sm font-semibold text-white/90">{r.name}</div>
              <div className="truncate text-[10px] text-white/40">
                {r.instagram} · {r.posts}p
              </div>
            </div>
            <div className="relative h-6 flex-1 overflow-hidden rounded bg-ink-800">
              <div
                className="h-full rounded bg-gradient-to-r from-gold-600 to-gold transition-all duration-1000"
                style={{ width: `${(r.totalEngagement / max) * 100}%` }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-[11px] font-bold text-white">
                {compact(r.totalEngagement)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
