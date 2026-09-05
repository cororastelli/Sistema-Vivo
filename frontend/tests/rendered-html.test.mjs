import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", { timeout: 60000 }, async (t) => {
  // Run the built Worker in its actual runtime, with local, disposable bindings.
  process.env.WRANGLER_SEND_METRICS = "false";
  process.env.WRANGLER_WRITE_LOGS = "false";
  const { unstable_dev } = await import("wrangler");
  const worker = await unstable_dev(
    fileURLToPath(new URL("../dist/server/index.js", import.meta.url)),
    {
      config: fileURLToPath(new URL("../dist/server/wrangler.json", import.meta.url)),
      local: true,
      persist: false,
      ip: "127.0.0.1",
      port: 0,
      inspectorPort: 0,
      logLevel: "error",
      experimental: {
        disableExperimentalWarning: true,
        disableDevRegistry: true,
        forceLocal: true,
        watch: false,
      },
    },
  );
  t.after(() => worker.stop());
  const response = await worker.fetch("/", { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(await response.text(), developmentPreviewMeta);
});
