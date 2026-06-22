// ==========================================================================
//  Cliente Supabase — SOMENTE servidor. As chaves nunca vão para o browser.
// ==========================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// service_role para escrita (script de coleta); anon para leitura no server.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabase(): boolean {
  return Boolean(url && (serviceKey || anonKey));
}

/** Cliente com permissão de escrita (usado pelo script de coleta). */
export function getServiceClient(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/** Cliente de leitura (usado pela API route do dashboard). */
export function getReadClient(): SupabaseClient {
  const key = serviceKey || anonKey;
  if (!url || !key) throw new Error("Supabase não configurado para leitura.");
  return createClient(url, key, { auth: { persistSession: false } });
}
