"use client";

import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compact, nf } from "@/lib/format";
import { FollowerGrowthPoint } from "@/lib/types";

export default function FollowerGrowthChart({ data }: { data: FollowerGrowthPoint[] }) {
  const min = Math.min(...data.map((d) => d.followers)) * 0.999;
  const max = Math.max(...data.map((d) => Math.max(d.followers, d.ideal))) * 1.001;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillFollowers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5B629" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#F5B629" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={28}
        />
        <YAxis
          domain={[min, max]}
          tickFormatter={(v) => compact(v as number)}
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: "#15151a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#fff",
          }}
          labelStyle={{ color: "rgba(255,255,255,0.6)" }}
          formatter={(value: number, name) => [
            nf(value),
            name === "followers" ? "Seguidores" : "Trajetória ideal",
          ]}
        />
        <Area
          type="monotone"
          dataKey="followers"
          stroke="#F5B629"
          strokeWidth={3}
          fill="url(#fillFollowers)"
          dot={false}
          isAnimationActive
        />
        <Line
          type="monotone"
          dataKey="ideal"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
          strokeDasharray="6 6"
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
