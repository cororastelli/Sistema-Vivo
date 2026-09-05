import type { DashboardData, SpaceRecord } from "./system-vivo-types";

export type ProblemFamily = {
  id: string;
  title: string;
  question: string;
  dimension: string;
  decision: string;
  nodes: { space: SpaceRecord; role: "evidencia local" | "caso comparable"; detail: string }[];
};

const definitions = [
  {
    id: "evidencia-decision",
    title: "Evidencia desconectada de la decisión",
    question: "¿Cómo pasan las voces, registros y evaluaciones a una agenda común y verificable?",
    dimension: "Gobernanza y participación",
    decision: "Definir responsables, instancia de participación y momento de nueva medición.",
    issueIds: ["issue-continuidad"],
    relationIds: ["rel-colegiales-estacion"],
  },
  {
    id: "barreras-continuidad",
    title: "Barreras y continuidad espacial",
    question: "¿Qué bordes, cruces o piezas interrumpen la experiencia aunque el parque figure como una unidad?",
    dimension: "Accesos, movilidad y conectividad",
    decision: "Comparar recorridos completos y priorizar conexiones medibles entre sectores.",
    issueIds: ["issue-ocupacion", "issue-acceso"],
    relationIds: ["rel-colegiales-palermo", "rel-colegiales-donado"],
  },
  {
    id: "uso-desigual",
    title: "Uso desigual entre sectores",
    question: "¿Qué condiciones explican que algunos sectores concentren permanencias y otros se eviten?",
    dimension: "Usos, flujos y tiempos",
    decision: "Cruzar conteos, actividades, sombra, equipamiento, visibilidad y horarios antes de intervenir.",
    issueIds: ["issue-ocupacion"],
    relationIds: ["rel-colegiales-palermo"],
  },
  {
    id: "cambio-necesidades",
    title: "Nuevas poblaciones, nuevas necesidades",
    question: "¿Cómo cambian los usos y cuidados cuando se transforma el entorno del espacio público?",
    dimension: "Demografía, cuidados y mantenimiento",
    decision: "Distinguir población residente, usuarios de paso y uso observado; volver a medir después de la obra.",
    issueIds: [],
    relationIds: ["rel-colegiales-estacion-ba"],
  },
] as const;

export function buildProblemFamilies(data: DashboardData): ProblemFamily[] {
  return definitions.map((definition) => {
    const nodes: ProblemFamily["nodes"] = [];
    for (const issue of data.issues.filter((item) => definition.issueIds.includes(item.id as never))) {
      const space = data.spaces.find((item) => item.id === issue.spaceId);
      if (space && !nodes.some((node) => node.space.id === space.id)) nodes.push({ space, role: "evidencia local", detail: issue.title });
    }
    for (const relation of data.relations.filter((item) => definition.relationIds.includes(item.id as never))) {
      const source = data.spaces.find((item) => item.id === relation.sourceSpaceId);
      const target = data.spaces.find((item) => item.id === relation.targetSpaceId);
      if (source && !nodes.some((node) => node.space.id === source.id)) nodes.push({ space: source, role: "evidencia local", detail: relation.explanation });
      if (target && !nodes.some((node) => node.space.id === target.id)) nodes.push({ space: target, role: "caso comparable", detail: relation.transferableLesson });
    }
    return { ...definition, nodes };
  }).filter((family) => family.nodes.length > 0);
}
