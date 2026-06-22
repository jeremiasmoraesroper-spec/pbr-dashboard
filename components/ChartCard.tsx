export default function ChartCard({
  title,
  right,
  children,
  className = "",
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card flex h-full flex-col p-4 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white/70 xl:text-base">
          {title}
        </h3>
        {right && <div className="text-xs text-white/45">{right}</div>}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
