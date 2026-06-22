"use client";

import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compact } from "@/lib/format";
import { PostsEngagementPoint } from "@/lib/types";

export default function PostsEngagementChart({ data }: { data: PostsEngagementPoint[] }) {
  // Dias sem post viram null para não gerar barras de altura zero (chaves duplicadas).
  const chartData = data.map((d) => ({
    ...d,
    interactions: d.interactions || null,
    posts: d.posts || null,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          minTickGap={16}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={(v) => compact(v as number)}
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <YAxis yAxisId="right" orientation="right" hide />
        <Tooltip
          contentStyle={{
            background: "#15151a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
          }}
          formatter={(value: number, name) => [
            name === "interactions" ? compact(value) : value,
            name === "interactions" ? "Engajamento" : "Posts",
          ]}
        />
        <Bar
          yAxisId="left"
          dataKey="interactions"
          fill="#F5B629"
          radius={[4, 4, 0, 0]}
          maxBarSize={18}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="posts"
          stroke="#22C55E"
          strokeWidth={2}
          dot={{ r: 2, fill: "#22C55E" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
