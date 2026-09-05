import type { EvaluationRecord, EvidenceRecord, IssueRecord, RelationRecord, SpaceRecord } from "./system-vivo-types";

export type CoverageState = "completa" | "parcial" | "pendiente";

export type DataRequirement = {
  id: string;
  label: string;
  group: "Base territorial" | "Experiencia" | "Gestión" | "Evaluación";
  question: string;
  providers: string;
  collection: string;
  records: string[];
  channels: string[];
  priority: number;
  matches: RegExp;
  officialField?: "identity" | "geometry";
  special?: "evaluation" | "relations";
};

export type RequirementResult = DataRequirement & {
  state: CoverageState;
  evidenceCount: number;
  validatedCount: number;
};

export type SpaceAnalysis = {
  coverage: number;
  completed: number;
  partial: number;
  pending: number;
  requirements: RequirementResult[];
  nextSteps: RequirementResult[];
  validatedEvidence: number;
  contextualEvidence: number;
  activeIssues: IssueRecord[];
  methodologicalAlerts: string[];
};

export const universalRequirements: DataRequirement[] = [
  { id: "identity", label: "Identidad y localización", group: "Base territorial", question: "¿Qué espacio es, cuánto ocupa y cuáles son sus límites?", providers: "Buenos Aires Data · Catastro · GCBA", collection: "Dataset oficial, polígono y plano base", records: ["nombre e ID oficial", "tipo y superficie", "límites y geometría"], channels: ["datos abiertos", "catastro", "planos"], priority: 1, matches: /geograf|superficie|localiz|territor/i, officialField: "identity" },
  { id: "context", label: "Población y entorno", group: "Base territorial", question: "¿Quiénes viven alrededor y qué actividades, transporte o cambios urbanos atraen otros públicos?", providers: "INDEC · IDECBA · Movilidad · trabajo de campo", collection: "Censo, usos del suelo, transporte, equipamientos y desarrollos próximos", records: ["población residente", "usuarios potenciales", "transporte y entorno", "proyecciones"], channels: ["censo", "datos urbanos", "campo"], priority: 2, matches: /demograf|poblaci|entorno|censo|transporte|residente/i },
  { id: "norms", label: "Normativa y restricciones", group: "Gestión", question: "¿Qué usos, horarios, protecciones y prohibiciones lo condicionan?", providers: "Legislatura · GCBA · organismos con competencia", collection: "Normas, convenios, permisos y pedidos de información", records: ["normas vigentes", "dominio", "horarios", "usos permitidos y prohibidos"], channels: ["boletín oficial", "legislatura", "organismos"], priority: 2, matches: /norm|restric|dominio|protecci/i },
  { id: "heritage", label: "Patrimonio y memoria", group: "Base territorial", question: "¿Qué bienes, paisajes o prácticas tienen valor histórico, cultural o identitario?", providers: "Patrimonio · archivos · organizaciones · especialistas", collection: "Inventario, protección, archivo histórico y memoria comunitaria", records: ["bienes protegidos", "valor cultural", "memorias locales", "condiciones de intervención"], channels: ["catálogos", "archivos", "entrevistas"], priority: 2, matches: /patrimon|memoria|históric|cultural|ferrovi/i },
  { id: "history", label: "Historia, proyectos y etapas", group: "Base territorial", question: "¿Qué se proyectó, qué se construyó y qué cambió?", providers: "Equipos proyectistas · BA Obras · archivos", collection: "Planos, pliegos, memorias, cronología y conforme a obra", records: ["proyectos previos", "etapas", "planos", "obra ejecutada", "cambios posteriores"], channels: ["BA Obras", "licitaciones", "equipos de proyecto"], priority: 1, matches: /historia|proyecto|etapa|obra/i },
  { id: "governance", label: "Actores y responsabilidades", group: "Gestión", question: "¿Quién usa, gestiona, mantiene, decide y financia?", providers: "Comuna · GCBA · Nación · privados · organizaciones", collection: "Mapa de actores, competencias y contactos", records: ["usuarios", "organismos", "organizaciones", "privados", "competencias y vínculos"], channels: ["organigramas", "entrevistas", "mapeo colectivo"], priority: 1, matches: /actor|gobern|gesti|responsab|instituc/i },
  { id: "access", label: "Accesos y conectividad", group: "Experiencia", question: "¿Cómo se entra, atraviesa y conecta, con y sin asistencia?", providers: "Trabajo de campo · COPIDIS · Movilidad", collection: "Mapa de accesos, cruces, barreras y recorridos", records: ["entradas", "cruces", "barreras", "pendientes", "cadena accesible"], channels: ["campo", "auditoría", "cartografía"], priority: 1, matches: /acces|conect|movilidad|cruce|barrera/i },
  { id: "uses", label: "Usos, flujos y tiempos", group: "Experiencia", question: "¿Quiénes llegan, qué hacen, dónde y en qué horarios?", providers: "Usuarios · observadores · transporte público", collection: "Conteos comparables, recorridos, permanencias y encuestas", records: ["perfil de uso", "actividad", "recorrido", "permanencia", "día y horario"], channels: ["conteos", "encuestas", "movilidad"], priority: 1, matches: /uso|flujo|permanencia|horario|actividad/i },
  { id: "environment", label: "Ambiente, clima, agua y biodiversidad", group: "Base territorial", question: "¿Cómo funcionan sombra, suelo, agua, vegetación, clima y hábitat?", providers: "Paisajistas · biólogos · APRA · trabajo de campo", collection: "Inventario, asoleamiento, drenaje, especies y estacionalidad", records: ["arbolado y especies", "sombra y asoleamiento", "suelo y drenaje", "agua y riesgo hídrico", "microclima"], channels: ["inventarios", "sensores", "campo", "papers"], priority: 2, matches: /ambient|clima|biodivers|veget|árbol|sombra|suelo|agua/i },
  { id: "equipment", label: "Equipamiento y servicios", group: "Experiencia", question: "¿Qué elementos existen, dónde están y para qué perfiles funcionan?", providers: "Comuna · proyectistas · usuarios", collection: "Inventario geolocalizado, características, disponibilidad y uso", records: ["mobiliario", "baños y agua", "juegos y deporte", "iluminación", "servicios de cuidado"], channels: ["planos", "inventario de campo", "usuarios"], priority: 2, matches: /equip|mobili|baño|banco|canil|luz|ilumin/i },
  { id: "maintenance", label: "Estado y mantenimiento", group: "Gestión", question: "¿Qué funciona, qué falla, quién lo mantiene y con qué frecuencia?", providers: "Comuna · contratistas · usuarios · organismos de control", collection: "Inspecciones, contratos, incidencias, frecuencia y vida útil", records: ["estado", "falla", "responsable", "frecuencia", "material y vida útil"], channels: ["contratos", "inspecciones", "reclamos", "campo"], priority: 2, matches: /manten|estado|rotura|limpieza|residuo|repar/i },
  { id: "safety", label: "Seguridad y conflictos", group: "Experiencia", question: "¿Qué incidentes, riesgos o superposiciones de uso aparecen?", providers: "Usuarios · emergencias · organismos · prensa", collection: "Incidentes fechados, reclamos y observación situada", records: ["incidentes", "riesgos", "percepción", "conflictos de uso", "respuesta institucional"], channels: ["emergencias", "prensa", "reclamos", "campo"], priority: 2, matches: /seguridad|conflic|riesgo|incidente|reclamo|noticia/i },
  { id: "voices", label: "Voces y participación", group: "Experiencia", question: "¿Qué experiencias coinciden, cuáles se contradicen y qué sesgos tienen?", providers: "Usuarios · organizaciones · expertos · equipos públicos", collection: "Entrevistas contextualizadas, aportes y talleres", records: ["frase o síntesis", "perfil", "contexto", "sesgo", "consentimiento"], channels: ["entrevistas", "talleres", "aportes web", "reseñas"], priority: 2, matches: /voz|entrevista|particip|testimonio|convers/i },
  { id: "resources", label: "Recursos, presupuesto y viabilidad", group: "Gestión", question: "¿Qué recursos, restricciones técnicas y capacidades condicionan una intervención?", providers: "Presupuesto · Comuna · contratistas · equipos técnicos", collection: "Presupuestos, contratos, costos de ciclo de vida y capacidades", records: ["presupuesto", "contrato", "costo de mantenimiento", "factibilidad", "plazos"], channels: ["presupuesto abierto", "licitaciones", "equipos técnicos"], priority: 3, matches: /presupuesto|costo|recurso|contrato|licitaci|factib/i },
  { id: "evaluation", label: "Evaluación DGANU", group: "Evaluación", question: "¿Qué muestran ex-ante, ex-post y expectativa sin ocultar faltantes?", providers: "Equipo evaluador · proyectistas · usuarios", collection: "Cuestionarios, reglas de cálculo y evidencia obligatoria", records: ["pregunta", "respuesta", "evidencia", "regla de cálculo", "faltante"], channels: ["manual DGANU", "planillas", "campo"], priority: 1, matches: /evaluaci|dganu|indicador/i, special: "evaluation" },
  { id: "analogs", label: "Casos comparables", group: "Evaluación", question: "¿Qué otros lugares comparten mecanismos y qué no es transferible?", providers: "Sistema Vivo · academia · equipos de proyecto", collection: "Casos documentados, lecciones y límites de comparación", records: ["problema compartido", "mecanismo", "resultado", "lección", "límite"], channels: ["papers", "proyectos", "evaluaciones", "noticias"], priority: 3, matches: /caso|análogo|compar/i, special: "relations" },
];

function requirementState(requirement: DataRequirement, space: SpaceRecord, evidence: EvidenceRecord[], evaluations: EvaluationRecord[], relations: RelationRecord[]): RequirementResult {
  const matches = evidence.filter((item) => item.layerId === requirement.id || requirement.matches.test(`${item.dimension} ${item.title}`));
  const validatedCount = matches.filter((item) => /validada/i.test(item.state)).length;
  let state: CoverageState = validatedCount > 0 ? "completa" : matches.length > 0 ? "parcial" : "pendiente";

  if (requirement.officialField === "identity") state = space.officialId && space.latitude != null && space.longitude != null && space.areaSqm != null ? "completa" : "parcial";
  if (requirement.special === "evaluation") {
    const stages = new Set(evaluations.map((item) => item.stage.toLocaleLowerCase("es")));
    state = ["ex-ante", "ex-post", "expectativa"].every((stage) => stages.has(stage))
      ? evaluations.every((item) => item.coverage === 100) ? "completa" : "parcial"
      : evaluations.length ? "parcial" : "pendiente";
  }
  if (requirement.special === "relations") state = relations.length >= 2 ? "completa" : relations.length ? "parcial" : "pendiente";

  return { ...requirement, state, evidenceCount: matches.length, validatedCount };
}

export function analyzeSpace(space: SpaceRecord, evidence: EvidenceRecord[], evaluations: EvaluationRecord[], issues: IssueRecord[], relations: RelationRecord[]): SpaceAnalysis {
  const requirements = universalRequirements.map((item) => requirementState(item, space, evidence, evaluations, relations));
  const completed = requirements.filter((item) => item.state === "completa").length;
  const partial = requirements.filter((item) => item.state === "parcial").length;
  const pending = requirements.filter((item) => item.state === "pendiente").length;
  const coverage = Math.round(((completed + partial * 0.5) / requirements.length) * 100);
  const nextSteps = requirements.filter((item) => item.state !== "completa").sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label, "es")).slice(0, 4);
  const methodologicalAlerts = evidence
    .filter((item) => item.limitation)
    .slice(0, 3)
    .map((item) => `${item.title}: ${item.limitation}`);

  return {
    coverage,
    completed,
    partial,
    pending,
    requirements,
    nextSteps,
    validatedEvidence: evidence.filter((item) => /validada/i.test(item.state)).length,
    contextualEvidence: evidence.filter((item) => !/validada/i.test(item.state)).length,
    activeIssues: issues,
    methodologicalAlerts,
  };
}
