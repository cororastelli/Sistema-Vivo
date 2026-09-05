const blockedTerms = [
  /\bputa\b/i,
  /\bputo\b/i,
  /\bpelotud[oa]s?\b/i,
  /\bbolud[oa]s?\b/i,
  /\bforr[oa]s?\b/i,
  /\bmierda\b/i,
];

const categories = [
  { id: "accesibilidad", match: /rampa|acces|silla|bast[oó]n|desnivel|vereda|cruce/i },
  { id: "mantenimiento", match: /roto|sucio|basura|manten|bebedero|ba[ñn]o|banco|luz|lumin/i },
  { id: "ambiente", match: /[áa]rbol|sombra|pasto|agua|calor|inund|biodivers|planta/i },
  { id: "seguridad", match: /miedo|insegur|robo|incend|riesgo|oscuro|violencia/i },
  { id: "usos y flujos", match: /gente|flujo|camina|corre|juega|perro|bicic|permane|circula/i },
  { id: "patrimonio", match: /patrimonio|hist[oó]ric|vag[oó]n|ferrovi|monumento/i },
];

export type ContributionReview = {
  status: "pending" | "blocked";
  category: string;
  completeness: number;
  moderationNote: string;
  missing: string[];
};

export function reviewContribution(input: {
  text: string;
  sector?: string | null;
  observedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  imageCount: number;
}): ContributionReview {
  const normalized = input.text.trim();
  const looksLikeSpam = (normalized.match(/https?:\/\//g) ?? []).length > 2 || /(.)\1{11,}/.test(normalized);
  const containsBlockedTerm = blockedTerms.some((term) => term.test(normalized));
  const missing: string[] = [];
  let completeness = 30;

  if (normalized.length >= 80) completeness += 10;
  else missing.push("ampliar qué ocurrió y a quién afecta");
  if (input.sector) completeness += 20;
  else missing.push("indicar el sector");
  if (input.observedAt) completeness += 20;
  else missing.push("agregar fecha y hora");
  if (input.latitude != null && input.longitude != null) completeness += 10;
  else missing.push("ubicar el punto");
  if (input.imageCount > 0) completeness += 10;
  else missing.push("adjuntar un registro visual, si existe");

  return {
    status: containsBlockedTerm || looksLikeSpam ? "blocked" : "pending",
    category: categories.find((item) => item.match.test(normalized))?.id ?? "otra observación",
    completeness: Math.min(completeness, 100),
    moderationNote: containsBlockedTerm
      ? "Lenguaje ofensivo detectado: el aporte no será visible."
      : looksLikeSpam
        ? "Patrón de spam detectado: el aporte no será visible."
        : "Control automático aprobado. Requiere revisión humana y contraste antes de afectar el análisis.",
    missing,
  };
}
