"use client";

import { useEffect, useState } from "react";
import { DashboardData } from "@/lib/types";
import Header from "./Header";
import Hero from "./Hero";
import GoalPanel from "./GoalPanel";
import KpiStrip from "./KpiStrip";
import ChartCard from "./ChartCard";
import TopPosts from "./TopPosts";
import AthleteRanking from "./AthleteRanking";
import FollowerGrowthChart from "./charts/FollowerGrowthChart";
import PostsEngagementChart from "./charts/PostsEngagementChart";
import EngagementTypeDonut from "./charts/EngagementTypeDonut";
import BestTimeHeatmap from "./charts/BestTimeHeatmap";

const REFRESH_MS = 5 * 60 * 1000; // 5 minutos

export default function Dashboard({ initial }: { initial: DashboardData }) {
  const [data, setData] = useState(initial);

  // Revalida a cada 5 min buscando o JSON já tratado da API route.
  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (res.ok) setData(await res.json());
      } catch {
        /* mantém os dados atuais em caso de falha de rede */
      }
    };
    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="wallboard bg-arena flex flex-col text-white">
      <Header data={data} />

      <main className="flex flex-1 flex-col gap-3 p-3 xl:min-h-0 xl:gap-3 xl:p-4 2xl:gap-4 2xl:p-5">
        {/* Linha 1 — destaque seguidores + status da meta */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-12 xl:min-h-0 xl:flex-[1.45] 2xl:gap-4">
          <div className="min-h-0 lg:col-span-8">
            <Hero data={data} />
          </div>
          <div className="min-h-0 lg:col-span-4">
            <GoalPanel goal={data.goal} />
          </div>
        </section>

        {/* Linha 2 — KPIs */}
        <section className="min-h-0 xl:flex-[0.72]">
          <KpiStrip kpis={data.kpis} />
        </section>

        {/* Linha 3 — gráficos principais */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-12 xl:min-h-0 xl:flex-[1.15] 2xl:gap-4">
          <div className="min-h-[240px] lg:col-span-6 xl:min-h-0">
            <ChartCard
              title="Crescimento de seguidores"
              right="real vs. trajetória ideal (---)"
            >
              <FollowerGrowthChart data={data.charts.followerGrowth} />
            </ChartCard>
          </div>
          <div className="min-h-[240px] lg:col-span-3 xl:min-h-0">
            <ChartCard title="Posts × engajamento" right="28 dias">
              <PostsEngagementChart data={data.charts.postsEngagement} />
            </ChartCard>
          </div>
          <div className="min-h-[240px] lg:col-span-3 xl:min-h-0">
            <ChartCard title="Engajamento por tipo" right="30 dias">
              <EngagementTypeDonut data={data.charts.engagementByType} />
            </ChartCard>
          </div>
        </section>

        {/* Linha 4 — top conteúdo, atletas, melhor horário */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-12 xl:min-h-0 xl:flex-[1.12] 2xl:gap-4">
          <div className="min-h-[200px] lg:col-span-5 xl:min-h-0">
            <TopPosts posts={data.topPosts.last7d} />
          </div>
          <div className="min-h-[200px] lg:col-span-4 xl:min-h-0">
            <AthleteRanking rows={data.athletes} />
          </div>
          <div className="min-h-[200px] lg:col-span-3 xl:min-h-0">
            <ChartCard title="Melhor dia/horário" right="por engajamento">
              <BestTimeHeatmap cells={data.charts.bestTime} />
            </ChartCard>
          </div>
        </section>
      </main>
    </div>
  );
}
