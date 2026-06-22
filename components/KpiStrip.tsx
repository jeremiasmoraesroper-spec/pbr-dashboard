"use client";

import { compact, nf, pct } from "@/lib/format";
import { Kpis } from "@/lib/types";

function Card({
  label,
  value,
  sub,
  tone = "white",
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  tone?: "white" | "gold" | "good";
}) {
  const toneClass =
    tone === "gold" ? "text-gold" : tone === "good" ? "text-good" : "text-white";
  return (
    <div className="card flex flex-col justify-between p-3 xl:p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45 xl:text-xs">
        {label}
      </div>
      <div className={`tabular font-display text-3xl font-bold leading-none xl:text-[2.6rem] ${toneClass}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-white/50 xl:text-xs">{sub}</div>}
    </div>
  );
}

export default function KpiStrip({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid h-full grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
      <Card
        label="Ganhos · 7 dias"
        value={`+${compact(kpis.gained7d.value)}`}
        tone="good"
        sub={<span className="text-good">{pct(kpis.gained7d.pct)}</span>}
      />
      <Card
        label="Ganhos · 30 dias"
        value={`+${compact(kpis.gained30d.value)}`}
        tone="good"
        sub={<span className="text-good">{pct(kpis.gained30d.pct)}</span>}
      />
      <Card
        label="Média / dia"
        value={nf(Math.round(kpis.avgPerDay7d))}
        tone="gold"
        sub={`30d: ${nf(Math.round(kpis.avgPerDay30d))}/dia`}
      />
      <Card
        label="Posts 7d · 30d"
        value={`${kpis.posts7d} · ${kpis.posts30d}`}
        sub={`${kpis.postsPerWeek.toFixed(1)} posts/semana`}
      />
      <Card
        label="Engajamento"
        value={`${kpis.engagementRate7d.toFixed(1)}%`}
        tone="gold"
        sub={`30d: ${kpis.engagementRate30d.toFixed(1)}% · base alcance`}
      />
      <Card
        label="Alcance · 7d"
        value={compact(kpis.reach7d)}
        sub={`30d: ${compact(kpis.reach30d)}`}
      />
      <Card
        label="Views perfil · 7d"
        value={compact(kpis.profileViews7d)}
        sub={`30d: ${compact(kpis.profileViews30d)}`}
      />
    </div>
  );
}
