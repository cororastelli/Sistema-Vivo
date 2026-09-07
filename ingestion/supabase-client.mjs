function serverHeaders(key) {
  if (!key || key.startsWith("sb_publishable_")) throw new Error("Se requiere una credencial privada de Supabase");
  return { apikey: key, ...(!key.startsWith("sb_secret_") ? { Authorization: `Bearer ${key}` } : {}) };
}

export function createSupabaseIngestionClient({ url, key, fetcher = fetch }) {
  const origin = new URL(url);
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash)
    throw new Error("La URL de Supabase no es válida");
  const auth = serverHeaders(key);
  async function request(path, options = {}) {
    const response = await fetcher(new URL(path, origin), {
      ...options,
      headers: { ...auth, ...options.headers },
      signal: AbortSignal.timeout(60_000),
      redirect: "manual",
    });
    if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
    return response;
  }
  async function rpc(name, body) {
    const response = await request(`/rest/v1/rpc/${name}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    return response.status === 204 ? null : response.json();
  }
  return {
    async getSource(sourceId) {
      const query = new URLSearchParams({ id: `eq.${sourceId}`, select: "last_content_hash" });
      const response = await request(`/rest/v1/ingestion_sources?${query}`);
      const rows = await response.json();
      return rows[0] ?? null;
    },
    async uploadSnapshot(objectKey, buffer) {
      await request(`/storage/v1/object/sv-source-documents/${objectKey}`, {
        method: "POST", headers: { "Content-Type": "application/geo+json", "x-upsert": "true" }, body: buffer,
      });
    },
    ingest(rows, metadata) { return rpc("sv_ingest_green_spaces", { p_rows: rows, p_metadata: metadata }); },
    recordFailure(sourceId, error) {
      return rpc("sv_ingestion_record_failure", { p_source_id: sourceId, p_error: String(error?.message || error).slice(0, 1000) });
    },
  };
}
