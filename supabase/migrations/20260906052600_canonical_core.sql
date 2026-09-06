-- Canonical core schema. Enable SV_DATA_BACKEND only after verified data import.
-- Preserves the existing public schema; no production records are included.
BEGIN;
CREATE SCHEMA sv_core;
REVOKE ALL ON SCHEMA sv_core FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA sv_core TO service_role;
CREATE TABLE sv_core.spaces (
  id text PRIMARY KEY,
  name text NOT NULL,
  neighborhood text NOT NULL,
  commune integer NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  description text NOT NULL,
  source_label text,
  source_url text,
  source_updated_at text,
  official_id text,
  location text,
  area_sqm double precision,
  latitude double precision,
  longitude double precision
);
ALTER TABLE sv_core.spaces ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.spaces TO service_role;
CREATE TABLE sv_core.sources (
  id text PRIMARY KEY,
  space_id text NOT NULL,
  title text NOT NULL,
  publisher text NOT NULL,
  kind text NOT NULL,
  url text,
  published_at text,
  checked_at text NOT NULL,
  reliability text NOT NULL
);
ALTER TABLE sv_core.sources ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.sources TO service_role;
CREATE TABLE sv_core.evidence (
  id text PRIMARY KEY,
  space_id text NOT NULL,
  source_id text,
  title text NOT NULL,
  detail text NOT NULL,
  dimension text NOT NULL,
  layer_id text,
  record_type text,
  provider text,
  geographic_scope text,
  state text NOT NULL,
  method text NOT NULL,
  limitation text,
  observed_at text,
  updated_at text
);
ALTER TABLE sv_core.evidence ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.evidence TO service_role;
CREATE TABLE sv_core.issues (
  id text PRIMARY KEY,
  space_id text NOT NULL,
  title text NOT NULL,
  statement text NOT NULL,
  status text NOT NULL,
  affected_actors text NOT NULL,
  evidence_count integer NOT NULL
);
ALTER TABLE sv_core.issues ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.issues TO service_role;
CREATE TABLE sv_core.stakeholders (
  id text PRIMARY KEY,
  space_id text NOT NULL,
  source_id text,
  name text NOT NULL,
  category text NOT NULL,
  role text NOT NULL,
  responsibility text NOT NULL,
  evidence_state text NOT NULL,
  limitation text
);
ALTER TABLE sv_core.stakeholders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.stakeholders TO service_role;
CREATE TABLE sv_core.projects (
  id text PRIMARY KEY,
  space_id text NOT NULL,
  source_id text,
  name text NOT NULL,
  kind text NOT NULL,
  period text,
  status text NOT NULL,
  scope text NOT NULL,
  evidence_state text NOT NULL,
  limitation text
);
ALTER TABLE sv_core.projects ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.projects TO service_role;
CREATE TABLE sv_core.regulations (
  id text PRIMARY KEY,
  space_id text NOT NULL,
  source_id text,
  title text NOT NULL,
  authority text NOT NULL,
  kind text NOT NULL,
  status text NOT NULL,
  applies_to text NOT NULL,
  evidence_state text NOT NULL,
  limitation text
);
ALTER TABLE sv_core.regulations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.regulations TO service_role;
CREATE TABLE sv_core.entity_links (
  id text PRIMARY KEY,
  space_id text NOT NULL,
  from_type text NOT NULL,
  from_id text NOT NULL,
  to_type text NOT NULL,
  to_id text NOT NULL,
  relation text NOT NULL,
  evidence_state text NOT NULL,
  note text
);
ALTER TABLE sv_core.entity_links ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.entity_links TO service_role;
CREATE TABLE sv_core.evaluations (
  id text PRIMARY KEY,
  space_id text NOT NULL,
  stage text NOT NULL,
  period text NOT NULL,
  coverage integer NOT NULL,
  score double precision,
  note text NOT NULL
);
ALTER TABLE sv_core.evaluations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.evaluations TO service_role;
CREATE TABLE sv_core.relations (
  id text PRIMARY KEY,
  source_space_id text NOT NULL,
  target_space_id text NOT NULL,
  title text NOT NULL,
  shared_mechanisms text NOT NULL,
  explanation text NOT NULL,
  transferable_lesson text NOT NULL,
  limitation text NOT NULL,
  evidence_state text NOT NULL
);
ALTER TABLE sv_core.relations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.relations TO service_role;
CREATE TABLE sv_core.contributions (
  id text PRIMARY KEY,
  space_id text NOT NULL,
  channel text NOT NULL,
  text text NOT NULL,
  sector text,
  observed_at text,
  profile text,
  latitude double precision,
  longitude double precision,
  category text,
  completeness integer NOT NULL,
  moderation_note text,
  status text NOT NULL,
  created_at text NOT NULL
);
ALTER TABLE sv_core.contributions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.contributions TO service_role;
CREATE TABLE sv_core.contribution_assets (
  id text PRIMARY KEY,
  contribution_id text NOT NULL,
  object_key text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  created_at text NOT NULL
);
ALTER TABLE sv_core.contribution_assets ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sv_core.contribution_assets TO service_role;
ALTER TABLE sv_core.sources ADD FOREIGN KEY (space_id) REFERENCES sv_core.spaces(id);
CREATE INDEX ON sv_core.sources (space_id);
ALTER TABLE sv_core.evidence ADD FOREIGN KEY (space_id) REFERENCES sv_core.spaces(id);
CREATE INDEX ON sv_core.evidence (space_id);
ALTER TABLE sv_core.evidence ADD FOREIGN KEY (source_id) REFERENCES sv_core.sources(id);
CREATE INDEX ON sv_core.evidence (source_id);
ALTER TABLE sv_core.issues ADD FOREIGN KEY (space_id) REFERENCES sv_core.spaces(id);
CREATE INDEX ON sv_core.issues (space_id);
ALTER TABLE sv_core.stakeholders ADD FOREIGN KEY (space_id) REFERENCES sv_core.spaces(id);
CREATE INDEX ON sv_core.stakeholders (space_id);
ALTER TABLE sv_core.stakeholders ADD FOREIGN KEY (source_id) REFERENCES sv_core.sources(id);
CREATE INDEX ON sv_core.stakeholders (source_id);
ALTER TABLE sv_core.projects ADD FOREIGN KEY (space_id) REFERENCES sv_core.spaces(id);
CREATE INDEX ON sv_core.projects (space_id);
ALTER TABLE sv_core.projects ADD FOREIGN KEY (source_id) REFERENCES sv_core.sources(id);
CREATE INDEX ON sv_core.projects (source_id);
ALTER TABLE sv_core.regulations ADD FOREIGN KEY (space_id) REFERENCES sv_core.spaces(id);
CREATE INDEX ON sv_core.regulations (space_id);
ALTER TABLE sv_core.regulations ADD FOREIGN KEY (source_id) REFERENCES sv_core.sources(id);
CREATE INDEX ON sv_core.regulations (source_id);
ALTER TABLE sv_core.entity_links ADD FOREIGN KEY (space_id) REFERENCES sv_core.spaces(id);
CREATE INDEX ON sv_core.entity_links (space_id);
ALTER TABLE sv_core.evaluations ADD FOREIGN KEY (space_id) REFERENCES sv_core.spaces(id);
CREATE INDEX ON sv_core.evaluations (space_id);
ALTER TABLE sv_core.contributions ADD FOREIGN KEY (space_id) REFERENCES sv_core.spaces(id);
CREATE INDEX ON sv_core.contributions (space_id);
ALTER TABLE sv_core.contribution_assets ADD FOREIGN KEY (contribution_id) REFERENCES sv_core.contributions(id);
CREATE INDEX ON sv_core.contribution_assets (contribution_id);
CREATE FUNCTION public.sv_core_dashboard() RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$ SELECT jsonb_build_object(
'spaces', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT * FROM sv_core.spaces ORDER BY 1) r),
'sources', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT * FROM sv_core.sources ORDER BY 1) r),
'evidence', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT e.*, s.title AS source_title, s.url AS source_url FROM sv_core.evidence e LEFT JOIN sv_core.sources s ON s.id=e.source_id ORDER BY 1) r),
'issues', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT * FROM sv_core.issues ORDER BY 1) r),
'stakeholders', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT * FROM sv_core.stakeholders ORDER BY 1) r),
'projects', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT * FROM sv_core.projects ORDER BY 1) r),
'regulations', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT * FROM sv_core.regulations ORDER BY 1) r),
'entity_links', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT * FROM sv_core.entity_links ORDER BY 1) r),
'evaluations', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT * FROM sv_core.evaluations ORDER BY 1) r),
'relations', (SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) FROM (SELECT * FROM sv_core.relations ORDER BY 1) r)
) $$;
REVOKE ALL ON FUNCTION public.sv_core_dashboard() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sv_core_dashboard() TO service_role;
CREATE FUNCTION public.sv_core_submit(p_contribution jsonb, p_assets jsonb) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
IF jsonb_typeof(p_assets) <> 'array' OR jsonb_array_length(p_assets) > 3 THEN RAISE EXCEPTION 'Invalid assets'; END IF;
IF (p_contribution->>'status') NOT IN ('pending','blocked') OR length(p_contribution->>'text') NOT BETWEEN 20 AND 2500 THEN RAISE EXCEPTION 'Invalid contribution'; END IF;
INSERT INTO sv_core.contributions SELECT * FROM jsonb_populate_record(NULL::sv_core.contributions,p_contribution);
IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_assets) a WHERE a->>'contribution_id' IS DISTINCT FROM p_contribution->>'id') THEN RAISE EXCEPTION 'Asset ownership mismatch'; END IF;
INSERT INTO sv_core.contribution_assets SELECT * FROM jsonb_populate_recordset(NULL::sv_core.contribution_assets,p_assets);
END; $$;
REVOKE ALL ON FUNCTION public.sv_core_submit(jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sv_core_submit(jsonb,jsonb) TO service_role;
COMMIT;
