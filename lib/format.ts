// ==========================================================================
//  Formatação (pt-BR) e utilidades de data
// ==========================================================================

const TZ = "America/Sao_Paulo";

/** 1735018 -> "1.735.018" */
export function nf(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(n));
}

/** 1735018 -> "1,74 mi" / 1426 -> "1,4 mil" */
export function compact(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** 12.3 -> "+12,3%" (com sinal). */
export function pct(n: number, withSign = true): string {
  const s = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(n);
  return withSign && n > 0 ? `+${s}%` : `${s}%`;
}

/** "2026-06-22" -> "22/06" */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** "2026-06-22" -> "22/06/2026" */
export function fullDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Data/hora "agora" formatada em SP, ex.: "22/06/2026 14:35". */
export function nowInSP(d = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Hora formatada de um ISO em SP, ex.: "14:35". */
export function timeInSP(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** YYYY-MM-DD de uma data, no timezone de SP. */
export function isoDateSP(d = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return parts; // en-CA já devolve YYYY-MM-DD
}

/** Diferença em dias inteiros entre duas datas YYYY-MM-DD (b - a). */
export function daysBetween(aIso: string, bIso: string): number {
  const a = Date.parse(`${aIso}T00:00:00Z`);
  const b = Date.parse(`${bIso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Soma `days` a uma data YYYY-MM-DD e devolve YYYY-MM-DD. */
export function addDays(iso: string, days: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** 192 dias -> "6 meses e 9 dias" (aproximação por 30,44 dias/mês). */
export function monthsAndDays(totalDays: number): string {
  if (totalDays <= 0) return "0 dias";
  const months = Math.floor(totalDays / 30.44);
  const days = Math.round(totalDays - months * 30.44);
  const mLabel = months === 1 ? "mês" : "meses";
  const dLabel = days === 1 ? "dia" : "dias";
  if (months <= 0) return `${days} ${dLabel}`;
  if (days <= 0) return `${months} ${mLabel}`;
  return `${months} ${mLabel} e ${days} ${dLabel}`;
}

export const DOW_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
