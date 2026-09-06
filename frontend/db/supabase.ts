import { env } from "cloudflare:workers";
import { createSupabaseStore } from "./supabase-store.mjs";

type IntegrationEnv = {
  SV_DATA_BACKEND?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};
export function usesSupabase() {
  const config = env as unknown as IntegrationEnv;
  const selected = config.SV_DATA_BACKEND || "d1";
  if (!["d1", "supabase"].includes(selected)) throw new Error("Unsupported data backend");
  return selected === "supabase";
}
export function getSupabaseStore() {
  const config = env as unknown as IntegrationEnv;
  const serverKey = config.SUPABASE_SECRET_KEY || config.SUPABASE_SERVICE_ROLE_KEY;
  if (!config.SUPABASE_URL || !serverKey)
    throw new Error("Supabase server configuration missing");
  return createSupabaseStore({ url: config.SUPABASE_URL, key: serverKey });
}
