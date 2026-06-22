"use client";

import { compact, DOW_LABELS } from "@/lib/format";
import { BestTimeCell } from "@/lib/types";

const SLOTS = [
  { label: "Madru", from: 0, to: 5 },
  { label: "Manhã", from: 6, to: 11 },
  { label: "Tarde", from: 12, to: 17 },
  { label: "Noite", from: 18, to: 23 },
];

export default function BestTimeHeatmap({ cells }: { cells: BestTimeCell[] }) {
  // Agrega (dia, faixa) -> média de engajamento.
  const grid: { sum: number; count: number }[][] = DOW_LABELS.map(() =>
    SLOTS.map(() => ({ sum: 0, count: 0 })),
  );
  for (const c of cells) {
    const slot = SLOTS.findIndex((s) => c.hour >= s.from && c.hour <= s.to);
    if (slot < 0) continue;
    const cell = grid[c.day][slot];
    cell.sum += c.value * c.count;
    cell.count += c.count;
  }

  let best = { day: -1, slot: -1, avg: 0 };
  const avgGrid = grid.map((row, d) =>
    row.map((cell, s) => {
      const avg = cell.count ? cell.sum / cell.count : 0;
      if (avg > best.avg) best = { day: d, slot: s, avg };
      return avg;
    }),
  );
  const max = best.avg || 1;

  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-[2.4rem_repeat(4,1fr)] gap-1">
        {/* cabeçalho de faixas */}
        <div />
        {SLOTS.map((s) => (
          <div key={s.label} className="text-center text-[10px] uppercase tracking-wider text-white/40">
            {s.label}
          </div>
        ))}
        {/* linhas por dia */}
        {DOW_LABELS.map((dow, d) => (
          <Row key={dow} dow={dow} d={d} avgGrid={avgGrid} max={max} best={best} />
        ))}
      </div>
      <div className="mt-2 text-[11px] text-white/50">
        {best.day >= 0 ? (
          <>
            Melhor janela:{" "}
            <span className="font-semibold text-gold">
              {DOW_LABELS[best.day]} · {SLOTS[best.slot].label}
            </span>{" "}
            ({compact(best.avg)} eng. médio)
          </>
        ) : (
          "Sem dados suficientes"
        )}
      </div>
    </div>
  );
}

function Row({
  dow,
  d,
  avgGrid,
  max,
  best,
}: {
  dow: string;
  d: number;
  avgGrid: number[][];
  max: number;
  best: { day: number; slot: number };
}) {
  return (
    <>
      <div className="flex items-center text-[11px] font-semibold text-white/50">{dow}</div>
      {avgGrid[d].map((avg, s) => {
        const intensity = avg / max; // 0..1
        const isBest = best.day === d && best.slot === s;
        return (
          <div
            key={s}
            className={`flex items-center justify-center rounded-md text-[10px] font-semibold ${
              isBest ? "ring-2 ring-gold" : ""
            }`}
            style={{
              background:
                avg > 0
                  ? `rgba(245,182,41,${0.12 + intensity * 0.85})`
                  : "rgba(255,255,255,0.04)",
              color: intensity > 0.55 ? "#08080a" : "rgba(255,255,255,0.75)",
            }}
          >
            {avg > 0 ? compact(avg) : "·"}
          </div>
        );
      })}
    </>
  );
}
