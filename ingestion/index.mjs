import { pathToFileURL } from "node:url";
import { createSupabaseIngestionClient } from "./supabase-client.mjs";
import { DATASET_PAGE_URL, DOWNLOAD_URL, SOURCE_ID, normalizeDataset, sha256 } from "./green-spaces.mjs";

const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024;

function dateFromHeader(value, fallback = new Date()) {
  const parsed = value ? new Date(value) : fallback;
  return (Number.isNaN(parsed.getTime()) ? fallback : parsed).toISOString().slice(0, 10);
}

async function download(fetcher) {
  const response = await fetcher(DOWNLOAD_URL, {
    headers: { "User-Agent": "Sistema-Vivo-ingestion/1.0" }, signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`La descarga oficial respondió ${response.status}`);
  const declaredSize = Number(response.headers.get("content-length"));
  if (declaredSize > MAX_DOWNLOAD_BYTES) throw new Error("La descarga oficial supera el límite permitido");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_DOWNLOAD_BYTES) throw new Error("La descarga oficial supera el límite permitido");
  return { response, buffer };
}

export async function runDailyIngestion({ env = process.env, fetcher = fetch, logger = console } = {}) {
  const startedAt = new Date().toISOString();
  let client;
  try {
    const { response, buffer } = await download(fetcher);
    const contentHash = sha256(buffer);
    const sourceUpdatedAt = dateFromHeader(response.headers.get("last-modified"));
    const rows = normalizeDataset(buffer, { sourceUpdatedAt });
    if (env.INGESTION_DRY_RUN === "true") {
      const result = { status: "verified", records: rows.length, contentHash, sourceUpdatedAt };
      logger.log(JSON.stringify(result));
      return result;
    }
    const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
    if (!env.SUPABASE_URL || !key) throw new Error("Falta la configuración privada de Supabase");
    client = createSupabaseIngestionClient({ url: env.SUPABASE_URL, key, fetcher });
    const previous = await client.getSource(SOURCE_ID);
    const changed = previous?.last_content_hash !== contentHash;
    let storageKey = null;
    if (changed) {
      storageKey = `green-spaces/${sourceUpdatedAt}-${contentHash.slice(0, 16)}.geojson`;
      await client.uploadSnapshot(storageKey, buffer);
    }
    const result = await client.ingest(rows, {
      source_id: SOURCE_ID, source_name: "Espacios verdes públicos", institution: "Buenos Aires Data",
      dataset_page_url: DATASET_PAGE_URL, download_url: DOWNLOAD_URL, final_url: response.url,
      started_at: startedAt, fetched_at: new Date().toISOString(), source_updated_at: sourceUpdatedAt,
      http_status: response.status, etag: response.headers.get("etag"), last_modified: response.headers.get("last-modified"),
      content_type: response.headers.get("content-type"), content_hash: contentHash, byte_size: buffer.length,
      changed, storage_key: storageKey,
    });
    logger.log(JSON.stringify({ status: "success", ...result }));
    return result;
  } catch (error) {
    if (client) {
      try { await client.recordFailure(SOURCE_ID, error); } catch { /* Railway conserva el error principal. */ }
    }
    logger.error(JSON.stringify({ status: "failed", error: error.message }));
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  runDailyIngestion().catch(() => { process.exitCode = 1; });
