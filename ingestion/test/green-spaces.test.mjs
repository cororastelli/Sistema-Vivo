import test from "node:test";
import assert from "node:assert/strict";
import { geometryCenter, normalizeDataset, normalizeFeature, sha256, titleCase } from "../green-spaces.mjs";
import { createSupabaseIngestionClient } from "../supabase-client.mjs";

const feature = (id = 2) => ({
  type: "Feature",
  properties: { id, nombre: "Plaza de prueba", barrio: "COLEGIALES", comuna: 13, ubicacion: "CALLE 1", clasificac: "PLAZOLETA", area: 100 },
  geometry: { type: "Polygon", coordinates: [[[-58.46,-34.59],[-58.44,-34.59],[-58.44,-34.57],[-58.46,-34.57],[-58.46,-34.59]]] },
});

test("normaliza el contrato oficial sin inventar datos", () => {
  const row = normalizeFeature(feature(), "2026-07-06");
  assert.deepEqual(geometryCenter(feature().geometry), { longitude: -58.45, latitude: -34.58 });
  assert.equal(row.official_id, "2");
  assert.equal(row.type, "Plazoleta");
  assert.equal(row.neighborhood, "Colegiales");
  assert.equal(row.source_updated_at, "2026-07-06");
  assert.equal(titleCase("PARQUE SEMIPÚBLICO"), "Parque Semipúblico");
});

test("rechaza colecciones incompletas y claves duplicadas", () => {
  const payload = (features) => Buffer.from(JSON.stringify({ type: "FeatureCollection", features }));
  assert.throws(() => normalizeDataset(payload([feature()]), { minimumRecords: 2 }), /solamente 1/);
  assert.throws(() => normalizeDataset(payload([feature(), feature()]), { minimumRecords: 2 }), /duplicados/);
});

test("calcula una huella estable", () => {
  assert.equal(sha256(Buffer.from("Sistema Vivo")), "5542594f1834bb4ff46e0426cccb3378a2ad791407d13228cec606dca4cd0274");
});

test("la credencial moderna no se envía como Bearer", async () => {
  let headers;
  const client = createSupabaseIngestionClient({
    url: "https://example.supabase.co", key: "sb_secret_example",
    fetcher: async (_url, options) => { headers = options.headers; return Response.json([]); },
  });
  await client.getSource("source");
  assert.equal(headers.apikey, "sb_secret_example");
  assert.equal(headers.Authorization, undefined);
});
