import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const spaces = sqliteTable("spaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  neighborhood: text("neighborhood").notNull(),
  commune: integer("commune").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("catalog"),
  description: text("description").notNull(),
  sourceLabel: text("source_label"),
  sourceUrl: text("source_url"),
  sourceUpdatedAt: text("source_updated_at"),
  officialId: text("official_id"),
  location: text("location"),
  areaSqm: real("area_sqm"),
  latitude: real("latitude"),
  longitude: real("longitude"),
}, (table) => [index("spaces_commune_idx").on(table.commune)]);

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull().references(() => spaces.id),
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  kind: text("kind").notNull(),
  url: text("url"),
  publishedAt: text("published_at"),
  checkedAt: text("checked_at").notNull(),
  reliability: text("reliability").notNull(),
}, (table) => [index("sources_space_idx").on(table.spaceId)]);

export const evidence = sqliteTable("evidence", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull().references(() => spaces.id),
  sourceId: text("source_id").references(() => sources.id),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  dimension: text("dimension").notNull(),
  layerId: text("layer_id"),
  recordType: text("record_type"),
  provider: text("provider"),
  geographicScope: text("geographic_scope"),
  state: text("state").notNull(),
  method: text("method").notNull(),
  limitation: text("limitation"),
  observedAt: text("observed_at"),
  updatedAt: text("updated_at"),
}, (table) => [index("evidence_space_idx").on(table.spaceId)]);

export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull().references(() => spaces.id),
  title: text("title").notNull(),
  statement: text("statement").notNull(),
  status: text("status").notNull(),
  affectedActors: text("affected_actors").notNull(),
  evidenceCount: integer("evidence_count").notNull().default(0),
});

export const stakeholders = sqliteTable("stakeholders", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull().references(() => spaces.id),
  sourceId: text("source_id").references(() => sources.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  role: text("role").notNull(),
  responsibility: text("responsibility").notNull(),
  evidenceState: text("evidence_state").notNull(),
  limitation: text("limitation"),
}, (table) => [index("stakeholders_space_idx").on(table.spaceId)]);

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull().references(() => spaces.id),
  sourceId: text("source_id").references(() => sources.id),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  period: text("period"),
  status: text("status").notNull(),
  scope: text("scope").notNull(),
  evidenceState: text("evidence_state").notNull(),
  limitation: text("limitation"),
}, (table) => [index("projects_space_idx").on(table.spaceId)]);

export const regulations = sqliteTable("regulations", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull().references(() => spaces.id),
  sourceId: text("source_id").references(() => sources.id),
  title: text("title").notNull(),
  authority: text("authority").notNull(),
  kind: text("kind").notNull(),
  status: text("status").notNull(),
  appliesTo: text("applies_to").notNull(),
  evidenceState: text("evidence_state").notNull(),
  limitation: text("limitation"),
}, (table) => [index("regulations_space_idx").on(table.spaceId)]);

export const entityLinks = sqliteTable("entity_links", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull().references(() => spaces.id),
  fromType: text("from_type").notNull(),
  fromId: text("from_id").notNull(),
  toType: text("to_type").notNull(),
  toId: text("to_id").notNull(),
  relation: text("relation").notNull(),
  evidenceState: text("evidence_state").notNull(),
  note: text("note"),
}, (table) => [index("entity_links_space_idx").on(table.spaceId)]);

export const evaluations = sqliteTable("evaluations", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull().references(() => spaces.id),
  stage: text("stage").notNull(),
  period: text("period").notNull(),
  coverage: integer("coverage").notNull(),
  score: real("score"),
  note: text("note").notNull(),
});

export const relations = sqliteTable("relations", {
  id: text("id").primaryKey(),
  sourceSpaceId: text("source_space_id").notNull(),
  targetSpaceId: text("target_space_id").notNull(),
  title: text("title").notNull(),
  sharedMechanisms: text("shared_mechanisms").notNull(),
  explanation: text("explanation").notNull(),
  transferableLesson: text("transferable_lesson").notNull(),
  limitation: text("limitation").notNull(),
  evidenceState: text("evidence_state").notNull().default("documentada"),
}, (table) => [
  index("relations_source_idx").on(table.sourceSpaceId),
  index("relations_target_idx").on(table.targetSpaceId),
]);

export const contributions = sqliteTable("contributions", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull().references(() => spaces.id),
  channel: text("channel").notNull().default("web"),
  text: text("text").notNull(),
  sector: text("sector"),
  observedAt: text("observed_at"),
  profile: text("profile"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  category: text("category"),
  completeness: integer("completeness").notNull().default(0),
  moderationNote: text("moderation_note"),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("contributions_space_idx").on(table.spaceId)]);

export const contributionAssets = sqliteTable("contribution_assets", {
  id: text("id").primaryKey(),
  contributionId: text("contribution_id").notNull().references(() => contributions.id),
  objectKey: text("object_key").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("contribution_assets_contribution_idx").on(table.contributionId)]);
