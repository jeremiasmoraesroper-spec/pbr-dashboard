"use client";

import AnimatedNumber from "./AnimatedNumber";
import { compact, fullDate, nf } from "@/lib/format";
import { GoalStatus } from "@/lib/types";

const STATUS = {
  ahead: { label: "Adiantado", color: "text-good", ring: "ring-good/50", bg: "bg-good/10", dot: "bg-good" },
  "on-track": { label: "No ritmo", color: "text-good", ring: "ring-good/50", bg: "bg-good/10", dot: "bg-good" },
  warning: { label: "Atenção", color: "text-warn", ring: "ring-warn/50", bg: "bg-warn/10", dot: "bg-warn" },
  behind: { label: "Atrasado", color: "text-alert", ring: "ring-alert/50", bg: "bg-alert/10", dot: "bg-alert" },
} as const;

export default function GoalPanel({ goal }: { goal: GoalStatus }) {
  const s = STATUS[goal.status];
  const paceVsNeeded = goal.neededPerDay > 0 ? goal.currentPace / goal.neededPerDay : 1;

  return (
    <div className={`card relative flex h-full flex-col p-5 ring-1 ${s.ring} xl:p-6`}>
      {/* topo: status */}
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
          Status da Meta
        </span>
        <span
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide ${s.bg} ${s.color}`}
        >
          <span className={`h-2.5 w-2.5 animate-pulse-ring rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      {/* necessário x ritmo */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat
          label="Precisa /dia"
          value={Math.round(goal.neededPerDay)}
          accent="text-white"
          sub="para bater 2M"
        />
        <Stat
          label="Ritmo atual /dia"
          value={Math.round(goal.currentPace)}
          accent={s.color}
          sub={`${(paceVsNeeded * 100).toFixed(0)}% do necessário`}
        />
      </div>

      {/* barra ritmo vs necessário */}
      <div className="mt-3">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-ink-800 ring-1 ring-white/10">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${s.dot}`}
            style={{ width: `${Math.min(100, paceVsNeeded * 100)}%` }}
          />
          {/* marca dos 100% (linha do necessário) */}
          <div className="absolute inset-y-0 right-0 w-px bg-white/40" />
        </div>
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
          <span>seu ritmo</span>
          <span>necessário</span>
        </div>
      </div>

      {/* projeção + tempo */}
      <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
        <div className="rounded-lg border border-white/10 bg-ink-800/60 p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">
            Projeção em {fullDate(goal.date)}
          </div>
          <AnimatedNumber
            value={goal.projection}
            format={compact}
            className={`tabular block font-display text-3xl font-bold ${
              goal.projectionHitsGoal ? "text-good" : "text-alert"
            }`}
          />
          <div className="text-[11px] text-white/50">
            {goal.projectionHitsGoal ? "acima de 2M ✓" : `abaixo de 2M (${compact(goal.target - goal.projection)})`}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-800/60 p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Tempo restante</div>
          <div className="tabular font-display text-3xl font-bold text-white">{goal.daysLeft}</div>
          <div className="text-[11px] text-white/50">dias · {goal.monthsLabel}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: number;
  accent: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-800/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className={`tabular font-display text-4xl font-bold ${accent}`}>{nf(value)}</div>
      <div className="text-[11px] text-white/50">{sub}</div>
    </div>
  );
}
