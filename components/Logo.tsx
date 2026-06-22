/** Marca PBR Brasil (placeholder estilizado).
 *  Para usar o logo oficial: troque por <img src="/logo-pbr.png" /> em /public. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-gold shadow-glow xl:h-14 xl:w-14">
        {/* Silhueta de touro */}
        <svg viewBox="0 0 64 64" className="h-8 w-8 xl:h-9 xl:w-9" fill="#08080a" aria-hidden>
          <path d="M12 16c-3 0-6 2-7 6-1 4 1 8 4 9-1-4 0-7 2-9 0 6 3 12 9 15-2 2-3 5-3 8 0 1 1 2 2 2s2-1 2-2c0-2 1-4 3-5 2 1 4 1 6 1s4 0 6-1c2 1 3 3 3 5 0 1 1 2 2 2s2-1 2-2c0-3-1-6-3-8 6-3 9-9 9-15 2 2 3 5 2 9 3-1 5-5 4-9-1-4-4-6-7-6-2 0-4 1-5 2-3-3-7-5-13-5s-10 2-13 5c-1-1-3-2-5-2zm12 18a3 3 0 110-6 3 3 0 010 6zm16 0a3 3 0 110-6 3 3 0 010 6z" />
        </svg>
      </span>
      <div className="leading-none">
        <div className="font-display text-2xl font-bold tracking-tight text-white xl:text-3xl">
          PBR <span className="text-gold">BRASIL</span>
        </div>
        <div className="font-display text-[11px] font-medium uppercase tracking-[0.35em] text-white/50 xl:text-xs">
          Professional Bull Riders
        </div>
      </div>
    </div>
  );
}
