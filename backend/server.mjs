import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";
import { createSupabaseStore } from "./supabase-store.mjs";

export function createApiServer({ store, token }) {
  if (!token || token.length < 32) throw new Error("Server access token required");
  const expected = Buffer.from(`Bearer ${token}`);
  const server = createServer(async (req,res) => {
    res.setHeader("Content-Type","application/json");
    res.setHeader("Cache-Control","no-store");
    const send = (status, body) => { res.writeHead(status); res.end(JSON.stringify(body)); };
    if (req.method !== "GET") return send(405,{ error:"Method not allowed" });
    const path = new URL(req.url,"http://localhost").pathname;
    if (path === "/health") return send(200,{ status:"ok" });
    const actual = Buffer.from(req.headers.authorization || "");
    if (actual.length !== expected.length || !timingSafeEqual(actual,expected))
      return send(401,{ error:"Unauthorized" });
    if (path !== "/v1/dashboard") return send(404,{ error:"Not found" });
    try { send(200,await store.readDashboard()); }
    catch { send(503,{ error:"Data service unavailable" }); }
  });
  server.requestTimeout = 20000;
  server.headersTimeout = 10000;
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, SV_API_TOKEN } = process.env;
  const serverKey = SUPABASE_SECRET_KEY || SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serverKey) throw new Error("Missing server configuration");
  const store = createSupabaseStore({ url: SUPABASE_URL, key: serverKey });
  const server = createApiServer({ store, token: SV_API_TOKEN });
  server.listen(Number(process.env.PORT || 3000),"0.0.0.0");
  for (const signal of ["SIGINT","SIGTERM"]) process.on(signal,() => server.close());
}
