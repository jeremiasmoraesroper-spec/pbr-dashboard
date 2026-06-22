// ==========================================================================
//  Tipos compartilhados — domínio do dashboard
// ==========================================================================

/** Um snapshot diário gravado no Supabase (1 linha por dia). */
export interface DailySnapshot {
  /** Data no formato YYYY-MM-DD (timezone America/Sao_Paulo). */
  date: string;
  /** Total de seguidores naquele dia (followers_count do Supermetrics). */
  followers: number;
  /** Novos seguidores do dia (follower_count). null = ainda sem dado válido (lag). */
  newFollowers: number | null;
  /** Alcance do dia (reach). */
  reach: number | null;
  /** Visualizações de perfil do dia (profile_views). */
  profileViews: number | null;
}

export type MediaType = "REELS" | "CAROUSEL" | "IMAGE" | "VIDEO";

/** Um post do Instagram com métricas de engajamento. */
export interface Post {
  mediaId: string;
  timestamp: string; // ISO
  type: MediaType;
  permalink: string;
  caption: string;
  thumbnailUrl: string;
  likes: number;
  comments: number;
  views: number;
  reach: number;
  saved: number;
  shares: number;
  /** interactions = soma das interações reportada pela API. */
  interactions: number;
}

/** Atleta/peão da PBR para o ranking de engajamento. */
export interface Athlete {
  id: string;
  name: string;
  instagram: string; // @handle
  hashtags: string[]; // termos pra cruzar com a legenda
}

/** Pacote completo já calculado que vai para o frontend. */
export interface DashboardData {
  meta: {
    accountName: string;
    accountUsername: string;
    generatedAt: string; // ISO — quando os dados foram montados
    followersDataUntil: string; // YYYY-MM-DD — último dia com novo seguidor válido
    isSeed: boolean; // true = dados de exemplo; false = dados reais
  };
  followers: {
    current: number;
    mediaCount: number;
    followsCount: number;
  };
  goal: GoalStatus;
  kpis: Kpis;
  charts: {
    followerGrowth: FollowerGrowthPoint[];
    postsEngagement: PostsEngagementPoint[];
    engagementByType: EngagementByTypePoint[];
    bestTime: BestTimeCell[];
  };
  topPosts: {
    last7d: Post[];
    last30d: Post[];
  };
  athletes: AthleteRankRow[];
}

export interface GoalStatus {
  target: number;
  date: string; // YYYY-MM-DD
  remaining: number;
  daysLeft: number;
  monthsLabel: string; // "X meses e Y dias"
  neededPerDay: number;
  currentPace: number; // ritmo recente/dia (média dos últimos dias válidos)
  pace30d: number;
  /** "ahead" | "on-track" | "warning" | "behind" */
  status: "ahead" | "on-track" | "warning" | "behind";
  projection: number; // projeção para a data da meta no ritmo atual
  projectionHitsGoal: boolean;
  progressPct: number; // % do caminho até a meta
}

export interface Kpis {
  gained7d: { value: number; pct: number };
  gained30d: { value: number; pct: number };
  avgPerDay7d: number;
  avgPerDay30d: number;
  posts7d: number;
  posts30d: number;
  postsPerWeek: number;
  engagementRate7d: number; // %
  engagementRate30d: number; // %
  reach7d: number;
  reach30d: number;
  profileViews7d: number;
  profileViews30d: number;
}

export interface FollowerGrowthPoint {
  date: string;
  followers: number;
  /** linha ideal da meta (trajetória necessária até 2M). */
  ideal: number;
}

export interface PostsEngagementPoint {
  /** rótulo do período (ex.: "16/06"). */
  label: string;
  posts: number;
  interactions: number;
}

export interface EngagementByTypePoint {
  type: string; // "Reel" | "Carrossel" | "Imagem"
  value: number; // engajamento médio por post
  count: number; // qtd de posts
  total: number; // engajamento total
}

export interface BestTimeCell {
  day: number; // 0=Dom ... 6=Sáb
  hour: number; // 0..23
  value: number; // engajamento médio
  count: number;
}

export interface AthleteRankRow {
  id: string;
  name: string;
  instagram: string;
  avgEngagement: number; // engajamento médio gerado quando aparece
  posts: number; // qtd de posts em que apareceu
  totalEngagement: number;
}
