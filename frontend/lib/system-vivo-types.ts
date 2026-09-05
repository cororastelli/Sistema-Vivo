export type SpaceRecord = {
  id: string;
  name: string;
  neighborhood: string;
  commune: number;
  type: string;
  status: string;
  description: string;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  sourceUpdatedAt?: string | null;
  officialId?: string | null;
  location?: string | null;
  areaSqm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type EvidenceRecord = {
  id: string;
  spaceId: string;
  title: string;
  detail: string;
  dimension: string;
  layerId?: string | null;
  recordType?: string | null;
  provider?: string | null;
  geographicScope?: string | null;
  state: string;
  method: string;
  limitation?: string | null;
  observedAt?: string | null;
  updatedAt?: string | null;
  sourceTitle?: string | null;
  sourceUrl?: string | null;
};

export type IssueRecord = {
  id: string;
  spaceId: string;
  title: string;
  statement: string;
  status: string;
  affectedActors: string;
  evidenceCount: number;
};

export type EvaluationRecord = {
  id: string;
  spaceId: string;
  stage: string;
  period: string;
  coverage: number;
  score: number | null;
  note: string;
};

export type RelationRecord = {
  id: string;
  sourceSpaceId: string;
  targetSpaceId: string;
  title: string;
  sharedMechanisms: string[];
  explanation: string;
  transferableLesson: string;
  limitation: string;
  evidenceState: string;
};

export type StakeholderRecord = { id: string; spaceId: string; name: string; category: string; role: string; responsibility: string; evidenceState: string; limitation?: string | null };
export type ProjectRecord = { id: string; spaceId: string; name: string; kind: string; period?: string | null; status: string; scope: string; evidenceState: string; limitation?: string | null };
export type RegulationRecord = { id: string; spaceId: string; title: string; authority: string; kind: string; status: string; appliesTo: string; evidenceState: string; limitation?: string | null };
export type EntityLinkRecord = { id: string; spaceId: string; fromType: string; fromId: string; toType: string; toId: string; relation: string; evidenceState: string; note?: string | null };

export type DashboardData = {
  spaces: SpaceRecord[];
  evidence: EvidenceRecord[];
  issues: IssueRecord[];
  evaluations: EvaluationRecord[];
  relations: RelationRecord[];
  stakeholders: StakeholderRecord[];
  projects: ProjectRecord[];
  regulations: RegulationRecord[];
  entityLinks: EntityLinkRecord[];
  databaseAvailable: boolean;
};
