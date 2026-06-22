import Logo from "./Logo";
import LiveClock from "./LiveClock";
import { fullDate, timeInSP } from "@/lib/format";
import { DashboardData } from "@/lib/types";

export default function Header({ data }: { data: DashboardData }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-3 xl:px-8">
      <div className="flex items-center gap-5">
        <Logo />
        <div className="hidden h-10 w-px bg-white/10 sm:block" />
        <div className="hidden sm:block">
          <div className="font-display text-xl font-semibold uppercase tracking-wide text-white xl:text-2xl">
            Mídia <span className="text-white/30">·</span>{" "}
            <span className="text-gold">Instagram</span>
          </div>
          <div className="text-xs text-white/45">@{data.meta.accountUsername} · gestão à vista</div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-right">
        {data.meta.isSeed && (
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
            Dados de exemplo
          </span>
        )}
        <div className="leading-tight">
          <div className="text-xs text-white/45">
            Atualizado em{" "}
            <span className="tabular text-white/70">{timeInSP(data.meta.generatedAt)}</span>
          </div>
          <div className="text-[11px] text-white/40">
            Seguidores até{" "}
            <span className="font-semibold text-gold/90">
              {fullDate(data.meta.followersDataUntil)}
            </span>
          </div>
        </div>
        <LiveClock />
      </div>
    </header>
  );
}
