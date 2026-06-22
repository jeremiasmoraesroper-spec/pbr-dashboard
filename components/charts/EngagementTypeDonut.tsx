"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { compact, nf } from "@/lib/format";
import { EngagementByTypePoint } from "@/lib/types";

const COLORS: Record<string, string> = {
  Reel: "#F5B629",
  Carrossel: "#22C55E",
  Imagem: "#60A5FA",
};

export default function EngagementTypeDonut({ data }: { data: EngagementByTypePoint[] }) {
  return (
    <div className="flex h-full items-center gap-2">
      <div className="relative h-full min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="type"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.type} fill={COLORS[d.type] ?? "#888"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#15151a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
              formatter={(value: number, _n, p: any) => [
                `${nf(value)} méd · ${p?.payload?.count} posts`,
                p?.payload?.type,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2 pr-1">
        {data.map((d) => (
          <div key={d.type} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: COLORS[d.type] ?? "#888" }}
            />
            <div className="leading-tight">
              <div className="text-xs font-semibold text-white/80">{d.type}</div>
              <div className="tabular text-[11px] text-white/45">
                {compact(d.value)} méd · {d.count}
              </div>
            </div>
          </div>
        ))}
        <div className="mt-1 border-t border-white/10 pt-1 text-[10px] uppercase tracking-wider text-white/35">
          eng. médio / post
        </div>
      </div>
    </div>
  );
}
