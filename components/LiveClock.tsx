"use client";

import { useEffect, useState } from "react";
import { nowInSP } from "@/lib/format";

/** Relógio que atualiza a cada segundo — dá a sensação de "ao vivo" na TV. */
export default function LiveClock() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () => setNow(nowInSP());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="hidden items-center gap-2 rounded-lg border border-white/10 bg-ink-700 px-3 py-2 lg:flex">
      <span className="h-2 w-2 animate-pulse-ring rounded-full bg-good" />
      <span className="tabular text-sm text-white/70" suppressHydrationWarning>
        {now || "—"}
      </span>
    </span>
  );
}
