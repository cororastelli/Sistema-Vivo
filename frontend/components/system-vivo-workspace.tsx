"use client";

import { FormEvent, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, ArrowUpRight, CheckCircle2, CircleAlert, Database, ImagePlus, LocateFixed, MapPin, Network, Plus, Search, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import type { DashboardData, SpaceRecord } from "@/lib/system-vivo-types";
import { analyzeSpace, type SpaceAnalysis } from "@/lib/space-analysis";
import { buildProblemFamilies, type ProblemFamily } from "@/lib/problem-families";

const CabaMap = dynamic(() => import("@/components/caba-map").then((module) => module.CabaMap), { ssr: false });

const tabs = ["Mapa", "Resumen", "Evidencias", "Gestión", "Análisis", "Problemas", "Casos vinculados", "Evaluación", "Fuentes"] as const;
type Tab = (typeof tabs)[number];

const stateLabel: Record<string, string> = {
  "case-study": "Caso desarrollado",
  reference: "Caso de referencia",
  catalog: "Registro preliminar",
};

export function SystemVivoWorkspace({ data }: { data: DashboardData }) {
  const [viewMode, setViewMode] = useState<"spaces" | "problems">("spaces");
  const [selectedId, setSelectedId] = useState(data.spaces.find((space) => space.status === "case-study")?.id ?? data.spaces[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [commune, setCommune] = useState("todas");
  const [kind, setKind] = useState("todos");
  const [tab, setTab] = useState<Tab>("Mapa");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("es");
    const rank: Record<string, number> = { "case-study": 0, reference: 1, catalog: 2 };
    const relevance = (space: SpaceRecord) => {
      if (!q) return 0;
      const name = space.name.toLocaleLowerCase("es");
      const neighborhood = space.neighborhood.toLocaleLowerCase("es");
      const location = space.location?.toLocaleLowerCase("es") ?? "";
      if (name === q || name.startsWith(q)) return 0;
      if (name.includes(q)) return 1;
      if (neighborhood === q) return 2;
      if (neighborhood.includes(q)) return 3;
      if (location.includes(q)) return 4;
      return 5;
    };
    return data.spaces.filter((space) => {
      const matchesQuery = !q || [space.name, space.neighborhood, space.location, `comuna ${space.commune}`].join(" ").toLocaleLowerCase("es").includes(q);
      const matchesCommune = commune === "todas" || String(space.commune) === commune;
      const matchesKind = kind === "todos" || space.type === kind;
      return matchesQuery && matchesCommune && matchesKind;
    }).sort((a, b) => relevance(a) - relevance(b) || (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || a.name.localeCompare(b.name, "es"));
  }, [data.spaces, query, commune, kind]);

  const visibleSpaces = filtered.slice(0, 80);
  const kinds = useMemo(() => Array.from(new Set(data.spaces.map((space) => space.type))).sort(), [data.spaces]);
  const problemFamilies = useMemo(() => buildProblemFamilies(data), [data]);

  const selected = data.spaces.find((space) => space.id === selectedId) ?? data.spaces[0];
  if (!selected) return null;

  const selectedEvidence = data.evidence.filter((item) => item.spaceId === selected.id);
  const selectedIssues = data.issues.filter((item) => item.spaceId === selected.id);
  const selectedEvaluations = data.evaluations.filter((item) => item.spaceId === selected.id);
  const selectedStakeholders = data.stakeholders.filter((item) => item.spaceId === selected.id);
  const selectedProjects = data.projects.filter((item) => item.spaceId === selected.id);
  const selectedRegulations = data.regulations.filter((item) => item.spaceId === selected.id);
  const selectedEntityLinks = data.entityLinks.filter((item) => item.spaceId === selected.id);
  const selectedRelations = data.relations.filter((item) => item.sourceSpaceId === selected.id || item.targetSpaceId === selected.id);
  const relatedIds = selectedRelations.map((item) => item.sourceSpaceId === selected.id ? item.targetSpaceId : item.sourceSpaceId);
  const analysis = analyzeSpace(selected, selectedEvidence, selectedEvaluations, selectedIssues, selectedRelations);

  return (
    <main className="sv-shell">
      <header className="sv-topbar">
        <a className="sv-brand" href="#inicio" aria-label="Sistema Vivo, inicio">
          <span className="sv-brand-dot" />
          <span>SISTEMA VIVO</span>
        </a>
        <div className="sv-top-meta">
          <span><ShieldCheck size={14} /> Acceso público</span>
          <span className={data.databaseAvailable ? "is-live" : "is-backup"}>
            <Database size={14} /> {data.databaseAvailable ? "Base conectada" : "Datos de respaldo"}
          </span>
        </div>
      </header>

      <section className="sv-intro" id="inicio">
        <div>
          <p className="sv-eyebrow">Infraestructura cívica · prototipo funcional</p>
          <h1>Lo que ya se sabe de un lugar, conectado.</h1>
        </div>
        <p className="sv-lead">Sistema Vivo reúne fuentes públicas, evaluación, trabajo de campo y aportes ciudadanos para hacer visibles relaciones que hoy quedan separadas. No reemplaza la decisión pública: construye una base verificable para discutirla.</p>
      </section>

      <nav className="sv-mode-switch" aria-label="Modo de exploración">
        <button className={viewMode === "spaces" ? "is-active" : ""} onClick={() => setViewMode("spaces")}><MapPin size={15} /> Explorar espacios</button>
        <button className={viewMode === "problems" ? "is-active" : ""} onClick={() => setViewMode("problems")}><Network size={15} /> Conectar problemas</button>
      </nav>

      {viewMode === "spaces" ? <section className="sv-workspace" aria-label="Explorador de espacios públicos">
        <aside className="sv-catalog">
          <div className="sv-catalog-head">
            <div>
              <span className="sv-kicker">Catálogo inicial</span>
              <strong>{data.spaces.filter((space) => space.officialId).length.toLocaleString("es-AR")} oficiales</strong>
              {data.spaces.some((space) => !space.officialId) && <small>+ {data.spaces.filter((space) => !space.officialId).length} caso sistémico</small>}
            </div>
            <span className="sv-pilot">PILOTO</span>
          </div>
          <label className="sv-search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar plaza, parque o comuna" />
          </label>
          <div className="sv-filters">
            <label>Comuna<select value={commune} onChange={(event) => setCommune(event.target.value)}><option value="todas">Todas</option>{Array.from({ length: 15 }, (_, index) => <option value={String(index + 1)} key={index + 1}>{index + 1}</option>)}</select></label>
            <label>Tipo<select value={kind} onChange={(event) => setKind(event.target.value)}><option value="todos">Todos</option>{kinds.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          </div>
          <div className="sv-results-count">{filtered.length.toLocaleString("es-AR")} resultados{filtered.length > 80 ? " · mostrando los primeros 80" : ""}</div>
          <div className="sv-space-list">
            {visibleSpaces.map((space) => (
              <button
                className={`sv-space-button ${space.id === selected.id ? "is-selected" : ""}`}
                key={space.id}
                onClick={() => { setSelectedId(space.id); setTab("Resumen"); }}
              >
                <span className="sv-space-icon"><MapPin size={16} /></span>
                <span>
                  <strong>{space.name}</strong>
                  <small>{space.neighborhood} · Comuna {space.commune}</small>
                </span>
                <span className="sv-space-arrow">↗</span>
              </button>
            ))}
          </div>
          <p className="sv-catalog-note">Catálogo basado en Buenos Aires Data. Que un lugar aparezca no significa que su diagnóstico esté completo: la ficha indica cuándo sólo existe información oficial básica.</p>
        </aside>

        <div className="sv-detail">
          <div className="sv-detail-head">
            <div>
              <div className="sv-status-row">
                <span className={`sv-status status-${selected.status}`}>{stateLabel[selected.status] ?? selected.status}</span>
                <span>{selected.type}</span>
              </div>
              <h2>{selected.name}</h2>
              <p>{selected.neighborhood} · Comuna {selected.commune}</p>
              {selected.location && <p className="sv-location">{selected.location}</p>}
            </div>
            <button className="sv-primary" onClick={() => { setNotice(null); setDialogOpen(true); }}><Plus size={17} /> Aportar información</button>
          </div>

          <nav className="sv-tabs" aria-label="Secciones del espacio">
            {tabs.map((item) => <button key={item} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>{item}</button>)}
          </nav>

          <div className="sv-tab-panel">
            {tab === "Mapa" && <CabaMap spaces={filtered} selectedId={selected.id} relatedIds={relatedIds} onSelect={(id) => { setSelectedId(id); }} />}
            {tab === "Resumen" && <Summary space={selected} analysis={analysis} evidenceCount={selectedEvidence.length} issueCount={selectedIssues.length} onAnalyze={() => setTab("Análisis")} />}
            {tab === "Evidencias" && <EvidenceList items={selectedEvidence} />}
            {tab === "Gestión" && <GovernancePanel stakeholders={selectedStakeholders} projects={selectedProjects} regulations={selectedRegulations} links={selectedEntityLinks} />}
            {tab === "Análisis" && <AnalysisPanel analysis={analysis} />}
            {tab === "Problemas" && <IssueList items={selectedIssues} />}
            {tab === "Casos vinculados" && <RelatedCases selected={selected} relations={selectedRelations} spaces={data.spaces} onOpen={(id) => { setSelectedId(id); setTab("Resumen"); }} />}
            {tab === "Evaluación" && <EvaluationList items={selectedEvaluations} />}
            {tab === "Fuentes" && <Sources space={selected} evidence={selectedEvidence} />}
          </div>
        </div>
      </section> : <ProblemExplorer families={problemFamilies} onOpenSpace={(id) => { setSelectedId(id); setTab("Problemas"); setViewMode("spaces"); }} />}

      <section className="sv-process">
        <div><span>01</span><strong>Recolectar</strong><p>Datos oficiales, manuales, proyectos, campo y voces.</p></div>
        <div><span>02</span><strong>Verificar</strong><p>Cada afirmación conserva fuente, fecha, método y límite.</p></div>
        <div><span>03</span><strong>Relacionar</strong><p>Los datos se conectan por lugar, actor, tiempo y dimensión.</p></div>
        <div><span>04</span><strong>Actuar y volver a medir</strong><p>El problema orienta proyectos; sus efectos vuelven al sistema.</p></div>
      </section>

      {dialogOpen && <ContributionDialog space={selected} notice={notice} onNotice={setNotice} onClose={() => setDialogOpen(false)} />}
    </main>
  );
}

function GovernancePanel({ stakeholders, projects, regulations, links }: { stakeholders: DashboardData["stakeholders"]; projects: DashboardData["projects"]; regulations: DashboardData["regulations"]; links: DashboardData["entityLinks"] }) {
  const entityNames = new Map<string, string>([
    ...stakeholders.map((item) => [item.id, item.name] as const),
    ...projects.map((item) => [item.id, item.name] as const),
    ...regulations.map((item) => [item.id, item.title] as const),
  ]);
  return <div className="sv-governance">
    <header className="sv-governance-head"><div><p className="sv-eyebrow">Estructura de decisión</p><h3>Quién interviene, sobre qué y con qué respaldo.</h3></div><p>La presencia de un actor no confirma automáticamente su competencia. El estado de cada registro diferencia responsabilidades documentadas de relaciones todavía pendientes de verificación.</p></header>
    <div className="sv-governance-counts"><div><strong>{stakeholders.length}</strong><span>actores registrados</span></div><div><strong>{projects.length}</strong><span>proyectos o etapas</span></div><div><strong>{regulations.length}</strong><span>normas vinculadas</span></div><div><strong>{links.length}</strong><span>relaciones explícitas</span></div></div>
    <section><div className="sv-section-title"><span>01</span><div><strong>Actores</strong><small>Usan, mantienen, deciden, financian o reclaman.</small></div></div>{stakeholders.length ? <div className="sv-entity-grid">{stakeholders.map((item) => <article key={item.id}><div><span>{item.category}</span><b>{item.evidenceState}</b></div><h4>{item.name}</h4><p>{item.role}</p><dl><dt>Responsabilidad o aporte</dt><dd>{item.responsibility}</dd>{item.limitation && <><dt>Límite</dt><dd>{item.limitation}</dd></>}</dl></article>)}</div> : <Empty title="Actores pendientes" text="Todavía no se vinculó un mapa de actores verificable para este espacio." />}</section>
    <section><div className="sv-section-title"><span>02</span><div><strong>Proyectos y etapas</strong><small>Lo previsto, ejecutado, modificado o propuesto.</small></div></div>{projects.length ? <div className="sv-entity-grid">{projects.map((item) => <article key={item.id}><div><span>{item.kind}</span><b>{item.evidenceState}</b></div><h4>{item.name}</h4><p>{item.scope}</p><dl><dt>Período</dt><dd>{item.period || "Sin fecha vinculada"}</dd><dt>Estado</dt><dd>{item.status}</dd>{item.limitation && <><dt>Límite</dt><dd>{item.limitation}</dd></>}</dl></article>)}</div> : <Empty title="Proyectos pendientes" text="Todavía no se incorporaron antecedentes de proyecto con fuente y período." />}</section>
    <section><div className="sv-section-title"><span>03</span><div><strong>Normas y restricciones</strong><small>Dominio, protección, horarios, usos y competencias.</small></div></div>{regulations.length ? <div className="sv-entity-grid">{regulations.map((item) => <article key={item.id}><div><span>{item.kind}</span><b>{item.evidenceState}</b></div><h4>{item.title}</h4><p>{item.appliesTo}</p><dl><dt>Autoridad</dt><dd>{item.authority}</dd><dt>Estado</dt><dd>{item.status}</dd></dl></article>)}</div> : <Empty title="Normativa específica pendiente" text="El sistema conserva este faltante: no completa dominio, protección o restricciones mediante supuestos." />}</section>
    <section><div className="sv-section-title"><span>04</span><div><strong>Relaciones registradas</strong><small>Los vínculos se guardan como datos, no quedan escondidos en un relato.</small></div></div>{links.length ? <div className="sv-link-list">{links.map((item) => <article key={item.id}><span>{item.fromType}</span><strong>{entityNames.get(item.fromId) || item.fromId}</strong><i>→</i><p>{item.relation}</p><i>→</i><strong>{entityNames.get(item.toId) || item.toId}</strong><b>{item.evidenceState}</b></article>)}</div> : <Empty title="Relaciones pendientes" text="Falta documentar cómo se conectan actores, proyectos, normas y problemas." />}</section>
  </div>;
}

function ProblemExplorer({ families, onOpenSpace }: { families: ProblemFamily[]; onOpenSpace: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState(families[0]?.id ?? "");
  const selected = families.find((family) => family.id === selectedId) ?? families[0];
  if (!selected) return <section className="sv-problem-explorer"><Empty title="Todavía no hay conexiones" text="Las familias aparecen cuando existe evidencia local o un caso comparable documentado." /></section>;
  return <section className="sv-problem-explorer" aria-label="Problemas conectados entre espacios">
    <header className="sv-problem-intro"><div><p className="sv-eyebrow">Lectura transversal</p><h2>Un problema puede aparecer en más de un territorio.</h2></div><p>El sistema no copia soluciones. Conecta mecanismos documentados para mostrar dónde existe evidencia local, qué otros casos sirven para aprender y qué decisión todavía requiere contraste.</p></header>
    <div className="sv-problem-layout">
      <aside className="sv-family-list">{families.map((family, index) => <button key={family.id} className={family.id === selected.id ? "is-active" : ""} onClick={() => setSelectedId(family.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{family.title}</strong><small>{family.nodes.length} {family.nodes.length === 1 ? "territorio conectado" : "territorios conectados"}</small></button>)}</aside>
      <article className="sv-family-detail">
        <div className="sv-family-heading"><span>{selected.dimension}</span><h3>{selected.title}</h3><p>{selected.question}</p></div>
        <div className="sv-family-network"><div className="sv-family-core"><Network size={20} /><strong>Mecanismo compartido</strong><small>No implica contextos idénticos</small></div>{selected.nodes.map((node) => <button key={node.space.id} onClick={() => onOpenSpace(node.space.id)}><span>{node.role}</span><strong>{node.space.name}</strong><small>{node.space.neighborhood} · C{node.space.commune}</small><p>{node.detail}</p><b>Abrir ficha <ArrowRight size={13} /></b></button>)}</div>
        <div className="sv-family-decision"><span>Pregunta para actuar</span><p>{selected.decision}</p></div>
      </article>
    </div>
  </section>;
}

function Summary({ space, analysis, evidenceCount, issueCount, onAnalyze }: { space: SpaceRecord; analysis: SpaceAnalysis; evidenceCount: number; issueCount: number; onAnalyze: () => void }) {
  return <div className="sv-summary-grid">
    <article className="sv-summary-main">
      <p className="sv-eyebrow">Qué sabemos ahora</p>
      <h3>{space.description}</h3>
      <p>El sistema distingue entre evidencia validada, observaciones contextuales y datos pendientes. Una ausencia de información no se completa con supuestos.</p>
    </article>
    <article className="sv-metric"><strong>{evidenceCount}</strong><span>evidencias conectadas</span><small>Documentales y de campo</small></article>
    <article className="sv-metric"><strong>{issueCount}</strong><span>problema emergente</span><small>No es un ranking automático</small></article>
    {space.areaSqm != null && <article className="sv-official-fact"><span>Superficie oficial</span><strong>{Math.round(space.areaSqm).toLocaleString("es-AR")} m²</strong><small>Buenos Aires Data · actualización 06/07/2026</small></article>}
    <article className="sv-next">
      <CircleAlert size={20} />
      <div><strong>Próximo faltante crítico</strong><p>{analysis.nextSteps[0]?.label ?? "La ficha no presenta faltantes críticos."}: {analysis.nextSteps[0]?.collection ?? "Revisión completa."}</p><button className="sv-text-action" onClick={onAnalyze}>Abrir análisis automático <ArrowRight size={14} /></button></div>
    </article>
  </div>;
}

function AnalysisPanel({ analysis }: { analysis: SpaceAnalysis }) {
  return <div className="sv-analysis">
    <section className="sv-analysis-hero">
      <div className="sv-coverage-ring" style={{ "--coverage": `${analysis.coverage * 3.6}deg` } as React.CSSProperties}><div><strong>{analysis.coverage}%</strong><span>cobertura</span></div></div>
      <div><p className="sv-eyebrow">Lectura automática · no reemplaza validación</p><h3>Primero mide cuánto sabemos. Después busca relaciones.</h3><p>La cobertura expresa disponibilidad y calidad de información en {analysis.requirements.length} capas universales. No es una nota del parque ni jerarquiza problemas automáticamente.</p></div>
      <div className="sv-analysis-counts"><span><b>{analysis.completed}</b> completas</span><span><b>{analysis.partial}</b> parciales</span><span><b>{analysis.pending}</b> pendientes</span></div>
    </section>

    <section className="sv-requirement-matrix">
      <header><div><p className="sv-eyebrow">Ficha universal</p><h3>Qué hay que cargar y quién puede aportarlo</h3></div><p>La misma estructura sirve para comparar plazas y parques sin obligarlos a ser iguales.</p></header>
      <div className="sv-requirement-list">{analysis.requirements.map((item, index) => <article key={item.id} className={`is-${item.state}`}>
        <span className="sv-requirement-number">{String(index + 1).padStart(2, "0")}</span>
        <div className="sv-requirement-main"><small>{item.group}</small><div><strong>{item.label}</strong><span>{item.state}</span></div><p>{item.question}</p></div>
        <div className="sv-requirement-owner"><UserRound size={15} /><span><b>Quién puede aportarlo</b>{item.providers}</span></div>
        <div className="sv-requirement-method"><span><b>Cómo se obtiene</b>{item.collection}</span></div>
        <details className="sv-requirement-fields"><summary>Ver qué datos se cargan y de dónde pueden venir</summary><div><p><b>Registros</b>{item.records.map((record) => <span key={record}>{record}</span>)}</p><p><b>Canales de origen</b>{item.channels.map((channel) => <span key={channel}>{channel}</span>)}</p></div></details>
      </article>)}</div>
    </section>

    <section className="sv-analysis-grid">
      <article className="sv-auto-reading"><p className="sv-eyebrow">Qué devuelve el sistema</p><h3>{analysis.activeIssues.length ? `${analysis.activeIssues.length} problemas en seguimiento` : "Todavía no formula un problema"}</h3><p>{analysis.activeIssues.length ? "Los muestra porque ya existe una formulación vinculada a evidencia; su estado indica cuánto falta contrastar." : "Primero necesita reunir evidencia diversa y situada."}</p>{analysis.activeIssues.map((issue) => <div key={issue.id}><Sparkles size={15} /><span><strong>{issue.title}</strong><small>{issue.status} · {issue.evidenceCount} evidencias vinculadas</small></span></div>)}</article>
      <article className="sv-next-actions"><p className="sv-eyebrow">Próximas acciones sugeridas</p>{analysis.nextSteps.map((item) => <div key={item.id}><span className={`sv-state-dot is-${item.state}`} /><p><strong>{item.label}</strong><small>{item.collection}<br />Solicitar o relevar con: {item.providers}</small></p></div>)}</article>
    </section>

    {analysis.methodologicalAlerts.length > 0 && <section className="sv-alert-strip"><strong>Alertas metodológicas</strong>{analysis.methodologicalAlerts.map((alert) => <p key={alert}>{alert}</p>)}</section>}
  </div>;
}

function EvidenceList({ items }: { items: DashboardData["evidence"] }) {
  if (!items.length) return <Empty title="Todavía no hay evidencia vinculada" text="El lugar está catalogado, pero su investigación aún no comenzó." />;
  return <div className="sv-card-list">{items.map((item) => <article className="sv-evidence-card" key={item.id}>
    <div className="sv-card-meta"><span>{item.recordType || item.dimension}</span><span className={`sv-proof proof-${item.state}`}>{item.state}</span></div>
    <h3>{item.title}</h3><p>{item.detail}</p>
    <dl><div><dt>Capa</dt><dd>{item.dimension}</dd></div>{item.provider && <div><dt>Proveedor</dt><dd>{item.provider}</dd></div>}{item.geographicScope && <div><dt>Alcance</dt><dd>{item.geographicScope}</dd></div>}<div><dt>Método</dt><dd>{item.method}</dd></div><div><dt>Límite</dt><dd>{item.limitation || "Sin limitación registrada"}</dd></div></dl>
    {item.sourceUrl && <a className="sv-inline-source" href={item.sourceUrl} target="_blank" rel="noreferrer">Abrir fuente <ArrowUpRight size={14} /></a>}
  </article>)}</div>;
}

function RelatedCases({ selected, relations, spaces, onOpen }: { selected: SpaceRecord; relations: DashboardData["relations"]; spaces: SpaceRecord[]; onOpen: (id: string) => void }) {
  if (!relations.length) return <Empty title="Todavía no hay casos vinculados" text="La relación aparece cuando existe un mecanismo compartido documentado; no se infiere sólo por cercanía o parecido visual." />;
  return <div className="sv-relations">
    <header className="sv-relations-head"><div><p className="sv-eyebrow">Red de aprendizaje entre territorios</p><h3>Problemas parecidos, contextos distintos.</h3></div><p>La conexión no afirma que dos lugares sean iguales. Explicita qué mecanismo comparten, qué aprendizaje puede transferirse y qué límite impide copiar una solución sin verificarla.</p></header>
    <div className="sv-relation-origin"><span>CASO ACTIVO</span><strong>{selected.name}</strong></div>
    <div className="sv-relation-list">{relations.map((relation) => {
      const otherId = relation.sourceSpaceId === selected.id ? relation.targetSpaceId : relation.sourceSpaceId;
      const other = spaces.find((space) => space.id === otherId);
      if (!other) return null;
      return <article className="sv-relation-card" key={relation.id}>
        <div className="sv-relation-link"><i /><span>{relation.evidenceState}</span></div>
        <div className="sv-relation-body">
          <div className="sv-card-meta"><span>{other.neighborhood} · C{other.commune}</span><span>{other.type}</span></div>
          <h3>{other.name}</h3><p>{relation.explanation}</p>
          <div className="sv-mechanisms">{relation.sharedMechanisms.map((mechanism) => <span key={mechanism}>{mechanism}</span>)}</div>
          <dl><div><dt>Aprendizaje transferible</dt><dd>{relation.transferableLesson}</dd></div><div><dt>Límite de la comparación</dt><dd>{relation.limitation}</dd></div></dl>
          <button className="sv-relation-open" onClick={() => onOpen(other.id)}>Abrir ficha <ArrowRight size={15} /></button>
        </div>
      </article>;
    })}</div>
  </div>;
}

function IssueList({ items }: { items: DashboardData["issues"] }) {
  if (!items.length) return <Empty title="Todavía no hay un problema sustentado" text="Sistema Vivo no formula un problema hasta reunir evidencia suficiente y diversa." />;
  return <div className="sv-card-list">{items.map((item) => <article className="sv-issue-card" key={item.id}>
    <div className="sv-card-meta"><span>Problema emergente</span><span>{item.evidenceCount} evidencias</span></div>
    <h3>{item.title}</h3><p>{item.statement}</p><small>Actores alcanzados: {item.affectedActors}</small>
  </article>)}</div>;
}

function EvaluationList({ items }: { items: DashboardData["evaluations"] }) {
  if (!items.length) return <Empty title="Evaluación pendiente" text="Aún no se aplicó la secuencia ex-ante, ex-post y expectativa a este lugar." />;
  return <div className="sv-evaluation-grid">{items.map((item) => <article className="sv-evaluation" key={item.id}>
    <div className="sv-ring" style={{ "--coverage": `${item.coverage * 3.6}deg` } as React.CSSProperties}><strong>{item.coverage}%</strong></div>
    <div><span>{item.stage}</span><small>{item.period}</small><p>{item.note}</p><b>{item.score == null ? "Resultado no emitido" : `Resultado ${item.score}`}</b></div>
  </article>)}</div>;
}

function Sources({ space, evidence }: { space: SpaceRecord; evidence: DashboardData["evidence"] }) {
  const sources = [{ title: space.sourceLabel, url: space.sourceUrl }, ...evidence.filter((item) => item.sourceTitle).map((item) => ({ title: item.sourceTitle, url: item.sourceUrl }))];
  const unique = sources.filter((item, index, list) => item.title && list.findIndex((candidate) => candidate.title === item.title) === index);
  const layers = [
    { label: "Geografía y superficie", ready: Boolean(space.officialId) },
    { label: "Normativa y restricciones", ready: evidence.some((item) => item.dimension.toLowerCase().includes("norm")) },
    { label: "Proyectos y antecedentes", ready: evidence.some((item) => item.dimension.toLowerCase().includes("proyecto")) },
    { label: "Uso, flujos y actores", ready: evidence.some((item) => /uso|flujo|actor/i.test(item.dimension)) },
    { label: "Noticias y reclamos", ready: evidence.some((item) => /noticia|reclamo/i.test(item.dimension)) },
  ];
  return <div className="sv-sources-layout"><div className="sv-layer-matrix"><div><span className="sv-kicker">Cobertura de la ficha</span><strong>{layers.filter((item) => item.ready).length}/{layers.length} capas vinculadas</strong></div>{layers.map((layer) => <p key={layer.label} className={layer.ready ? "is-ready" : "is-pending"}><i />{layer.label}<b>{layer.ready ? "Disponible" : "Pendiente"}</b></p>)}</div><div className="sv-source-list">{unique.map((source) => <article key={source.title ?? "source"}><CheckCircle2 size={18} /><div><strong>{source.title}</strong><p>Fuente vinculada al registro. La fecha y el alcance se verifican antes de usarla como evidencia.</p></div>{source.url && <a href={source.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${source.title}`}><ArrowUpRight size={18} /></a>}</article>)}</div></div>;
}

function Empty({ title, text }: { title: string; text: string }) { return <div className="sv-empty"><span>○</span><h3>{title}</h3><p>{text}</p></div>; }

function ContributionDialog({ space, notice, onNotice, onClose }: { space: SpaceRecord; notice: string | null; onNotice: (value: string | null) => void; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  function locate() {
    setLocationMessage("Buscando ubicación…");
    navigator.geolocation.getCurrentPosition(
      (position) => { setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }); setLocationMessage("Ubicación registrada para este aporte."); },
      () => setLocationMessage("No pudimos acceder a tu ubicación. Podés enviar el aporte igualmente."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); onNotice(null);
    const target = event.currentTarget;
    const form = new FormData(target);
    form.set("spaceId", space.id);
    if (location) { form.set("latitude", String(location.latitude)); form.set("longitude", String(location.longitude)); }
    const response = await fetch("/api/contributions", { method: "POST", body: form });
    const result = await response.json() as { error?: string; status?: string; completeness?: number; category?: string; missing?: string[] };
    if (response.ok) {
      const state = result.status === "blocked" ? "El control automático lo retuvo y no será visible." : "Quedó pendiente de revisión y contraste.";
      const missing = result.missing?.length ? ` Para fortalecerlo: ${result.missing.slice(0, 2).join("; ")}.` : "";
      onNotice(`Aporte recibido · ${result.completeness}% de integridad · categoría ${result.category}. ${state}${missing}`);
      target.reset(); setLocation(null); setLocationMessage(null);
    } else onNotice(result.error || "No pudimos guardar el aporte.");
    setPending(false);
  }
  return <div className="sv-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="sv-modal" role="dialog" aria-modal="true" aria-labelledby="contribution-title">
      <button className="sv-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
      <p className="sv-eyebrow">Aporte ciudadano · revisión obligatoria</p><h2 id="contribution-title">Contanos qué sucede en {space.name}</h2>
      <p>Describí un hecho observable. El sistema controla integridad y lenguaje; después una persona debe contrastarlo antes de que afecte el análisis público.</p>
      <form onSubmit={submit}>
        <div className="sv-form-grid"><label>Sector o referencia<input name="sector" maxLength={120} placeholder="Ej. acceso por Av. Lacroze" /></label><label>Fecha y hora observada<input name="observedAt" type="datetime-local" /></label></div>
        <label>¿Desde qué experiencia lo observaste? <span>Opcional</span><select name="profile" defaultValue=""><option value="">Prefiero no indicarlo</option><option>Vecino/a</option><option>Paso o conexión</option><option>Familia o tareas de cuidado</option><option>Persona mayor</option><option>Movilidad reducida</option><option>Actividad física</option><option>Paseo con mascota</option><option>Trabajo o estudio</option><option>Otra</option></select></label>
        <label>¿Qué observaste?<textarea name="text" required minLength={20} maxLength={2500} rows={5} placeholder="Qué pasó, dónde, cuándo y a quiénes afecta…" /></label>
        <div className="sv-capture-row"><label className="sv-file-control"><ImagePlus size={17} /><span><strong>Adjuntar imágenes</strong><small>Hasta 3 · JPG, PNG o WebP · 5 MB</small></span><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple /></label><button className="sv-location-control" type="button" onClick={locate}><LocateFixed size={17} /><span><strong>Usar mi ubicación</strong><small>{locationMessage || "Opcional · mejora el mapeo"}</small></span></button></div>
        <div className="sv-review-note"><ShieldCheck size={17} /><p><strong>Nada se publica automáticamente.</strong><span>Los aportes ofensivos o con spam se retienen. Los demás esperan revisión humana y contraste con otras fuentes.</span></p></div>
        <button className="sv-primary" disabled={pending}>{pending ? "Guardando…" : "Enviar para revisión"}</button>
      </form>
      {notice && <div className="sv-notice">{notice}</div>}
    </section>
  </div>;
}
