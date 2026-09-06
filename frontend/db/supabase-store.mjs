const MAX_IMAGE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const camel = (row) => Object.fromEntries(Object.entries(row).map(([k,v]) => [k.replace(/_([a-z])/g, (_,c) => c.toUpperCase()),v]));

export function createSupabaseStore({ url, key, fetcher = fetch, uuid = () => crypto.randomUUID() }) {
  const origin = new URL(url);
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash)
    throw new Error("Invalid Supabase URL");
  if (!key || key.startsWith("sb_publishable_")) throw new Error("Server credential required");
  // Supabase's new sb_secret_* keys are sent only through apikey. Sending one
  // as a Bearer token is rejected as browser usage. Legacy service_role JWTs
  // still require the Authorization header.
  const headers = {
    apikey: key,
    ...(!key.startsWith("sb_secret_") ? { Authorization: `Bearer ${key}` } : {}),
  };
  async function request(path, options = {}) {
    const response = await fetcher(new URL(path, origin), {
      ...options,
      headers: { ...headers, ...options.headers },
      signal: AbortSignal.timeout(15000),
      // Cloudflare Workers rejects redirect:"error". "manual" keeps redirects
      // blocked while remaining portable across Node and the edge runtime.
      redirect: "manual",
    });
    if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
    return response;
  }
  async function rpc(name, body = {}) {
    const response = await request(`/rest/v1/rpc/${name}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    return response.status === 204 ? null : response.json();
  }
  return {
    async readDashboard() {
      const data = await rpc("sv_core_dashboard");
      const names = ["spaces", "evidence", "issues", "evaluations", "relations", "stakeholders", "projects", "regulations", "entity_links"];
      if (!data || !names.every(name => Array.isArray(data[name])) || !data.spaces.length)
        throw new Error("Canonical dataset not ready");
      const mapped = Object.fromEntries(names.map(name => [name === "entity_links" ? "entityLinks" : name, data[name].map(camel)]));
      mapped.relations = mapped.relations.map(row => {
        const mechanisms = typeof row.sharedMechanisms === "string" ? JSON.parse(row.sharedMechanisms) : row.sharedMechanisms;
        if (!Array.isArray(mechanisms) || mechanisms.some(x => typeof x !== "string")) throw new Error("Invalid relationship");
        return { ...row, sharedMechanisms: mechanisms };
      });
      return { ...mapped, databaseAvailable: true };
    },
    async saveContribution(input, images, review) {
      if (images.length > 3 || images.some(file => !IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE))
        throw new Error("Invalid images");
      if (!["pending","blocked"].includes(review.status)) throw new Error("Invalid review status");
      const id = uuid(), createdAt = new Date().toISOString(), uploaded = [];
      const contribution = {
        id, space_id: input.spaceId, channel: "web", text: input.text,
        sector: input.sector || null, observed_at: input.observedAt || null, profile: input.profile || null,
        latitude: input.latitude ?? null, longitude: input.longitude ?? null, category: review.category,
        completeness: review.completeness, moderation_note: review.moderationNote,
        status: review.status, created_at: createdAt,
      };
      const assets = [];
      let committing = false;
      try {
        for (const file of images) {
          const assetId = uuid();
          const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
          const objectKey = `contributions/${id}/${assetId}.${extension}`;
          await request(`/storage/v1/object/sv-contributions/${objectKey}`, {
            method: "POST", headers: { "Content-Type": file.type, "x-upsert": "false" }, body: await file.arrayBuffer(),
          });
          uploaded.push(objectKey);
          assets.push({ id: assetId, contribution_id: id, object_key: objectKey, file_name: file.name.slice(0,180),
            mime_type: file.type, size_bytes: file.size, created_at: createdAt });
        }
        committing = true;
        await rpc("sv_core_submit", { p_contribution: contribution, p_assets: assets });
        return { id, ...review };
      } catch (error) {
        // Before commit, objects are definitely unreferenced. After a timeout during
        // commit the outcome is unknown: retain objects instead of breaking a saved record.
        if (uploaded.length && !committing) {
          try {
            await request("/storage/v1/object/sv-contributions", { method: "DELETE",
              headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: uploaded }) });
          } catch { /* Reconcile orphaned private objects administratively. */ }
        }
        throw error;
      }
    },
  };
}
