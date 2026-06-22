// ==========================================================================
//  API route server-side: entrega o DashboardData já calculado.
//  O frontend (browser) só consome este JSON — nunca toca nas chaves.
// ==========================================================================

import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/data";

// Recalcula no máximo a cada 5 min no servidor (ISR-like p/ route handler).
export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data, {
      headers: {
        // Cache de borda 5 min + serve "stale" enquanto revalida.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("Erro ao montar dashboard:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
