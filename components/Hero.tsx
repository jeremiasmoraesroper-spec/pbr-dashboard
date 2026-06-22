"use client";

import AnimatedNumber from "./AnimatedNumber";
import { compact, nf, pct } from "@/lib/format";
import { DashboardData } from "@/lib/types";

export default function Hero({ data }: { data: DashboardData }) {
  const { followers, goal, kpis } = data;
  return (
    <div className="card card-gold relative flex h-full flex-col justify-between overflow-hidden p-5 xl:p-7">
      {/* faixa decorativa */}
      <div className="stripe pointer-events-none absolute right-0 top-0 h-full w-24 opacity-[0.06]" />

      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-gold/90">
            Seguidores no Instagram
          </div>
          <AnimatedNumber
            value={followers.current}
            className="tabular block font-display text-[4.5rem] font-bold leading-[0.95] text-white xl:text-[6.5rem] 2xl:text-[7.5rem]"
          />
        </div>
        <div className="hidden flex-col items-end gap-1 text-right lg:flex">
          <Pill label="Hoje" value={`${nf(Math.round(kpis.avgPerDay7d))}/dia`} />
          <Pill label="7 dias" value={pct(kpis.gained7d.pct)} good={kpis.gained7d.value > 0} />
        </div>
      </div>

      {/* Barra de progresso da META */}
      <div className="mt-2">
        <div className="mb-2 flex items-end justify-between">
          <span className="font-display text-base font-semibold uppercase tracking-wide text-white/70">
            Meta 2026 · <span className="text-gold">{compact(goal.target)}</span>
          </span>
          <span className="tabular font-display text-3xl font-bold text-gold xl:text-4xl">
            {goal.progressPct.toFixed(1)}%
          </span>
        </div>
        <div className="relative h-7 w-full overflow-hidden rounded-full bg-ink-800 ring-1 ring-white/10 xl:h-8">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-600 via-gold to-gold-400 shadow-glow transition-[width] duration-1000 ease-out"
            style={{ width: `${Math.max(2, goal.progressPct)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-4 text-[11px] font-semibold text-black/70">
            <span>{nf(followers.current)}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-between text-xs text-white/45">
          <span>
            Faltam <span className="font-semibold text-white/80">{nf(goal.remaining)}</span>
          </span>
          <span>
            {nf(followers.mediaCount)} publicações · segue {followers.followsCount}
          </span>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-700 px-3 py-1.5 text-right">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className={`tabular text-lg font-bold ${good ? "text-good" : "text-white"}`}>{value}</div>
    </div>
  );
}
