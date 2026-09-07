import { createHash } from "node:crypto";

export const SOURCE_ID = "ba-green-spaces-public";
export const DATASET_PAGE_URL = "https://data.buenosaires.gob.ar/dataset/espacios-verdes";
export const DOWNLOAD_URL = "https://data.buenosaires.gob.ar/dataset/espacios-verdes/resource/2a9af960-02a3-44bb-b57e-0a8295f6e0e2/download";

const clean = (value) => value == null ? "" : String(value).trim();
const numberOrNull = (value) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function titleCase(value) {
  return clean(value).toLocaleLowerCase("es-AR").replace(/(^|[\s/-])\p{L}/gu, (letter) => letter.toLocaleUpperCase("es-AR"));
}

export function geometryCenter(geometry) {
  const points = [];
  const collect = (value) => {
    if (Array.isArray(value) && value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
      if (Number.isFinite(value[0]) && Number.isFinite(value[1])) points.push(value);
      return;
    }
    if (Array.isArray(value)) value.forEach(collect);
  };
  collect(geometry?.coordinates);
  if (!points.length) throw new Error("El registro no contiene una geometría válida");
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  return {
    longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  };
}

export function normalizeFeature(feature, sourceUpdatedAt) {
  const properties = feature?.properties ?? {};
  const officialId = clean(properties.id);
  if (!officialId) throw new Error("Hay un espacio sin identificador oficial");
  const commune = numberOrNull(properties.comuna);
  const areaSqm = numberOrNull(properties.area);
  if (!Number.isInteger(commune) || commune < 1 || commune > 15) throw new Error(`Comuna inválida para el espacio ${officialId}`);
  if (areaSqm != null && areaSqm < 0) throw new Error(`Superficie inválida para el espacio ${officialId}`);
  const type = titleCase(properties.clasificac) || "Espacio verde";
  const { latitude, longitude } = geometryCenter(feature.geometry);
  if (latitude < -35 || latitude > -34 || longitude < -59 || longitude > -57.5)
    throw new Error(`Coordenadas fuera de CABA para el espacio ${officialId}`);
  return {
    official_id: officialId,
    name: clean(properties.nombre) || clean(properties.nom_mapa) || `${type} ${officialId}`,
    neighborhood: titleCase(properties.barrio) || "Sin barrio informado",
    commune,
    type,
    source_label: "Buenos Aires Data · Espacios verdes",
    source_url: DATASET_PAGE_URL,
    source_updated_at: sourceUpdatedAt,
    location: clean(properties.ubicacion) || null,
    area_sqm: areaSqm,
    latitude,
    longitude,
  };
}

export function normalizeDataset(buffer, { minimumRecords = 1000, sourceUpdatedAt } = {}) {
  let document;
  try { document = JSON.parse(buffer.toString("utf8")); }
  catch { throw new Error("La fuente oficial no devolvió un GeoJSON válido"); }
  if (document?.type !== "FeatureCollection" || !Array.isArray(document.features))
    throw new Error("La fuente oficial no devolvió una colección GeoJSON");
  if (document.features.length < minimumRecords)
    throw new Error(`La fuente devolvió solamente ${document.features.length} registros`);
  const rows = document.features.map((feature) => normalizeFeature(feature, sourceUpdatedAt));
  if (new Set(rows.map((row) => row.official_id)).size !== rows.length)
    throw new Error("La fuente contiene identificadores oficiales duplicados");
  return rows;
}

export const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
