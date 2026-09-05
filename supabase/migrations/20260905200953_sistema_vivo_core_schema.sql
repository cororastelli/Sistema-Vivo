CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE spaces (
  id text PRIMARY KEY,
  official_name text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}',
  space_type text,
  neighborhood text,
  commune integer,
  surface_m2 numeric,
  boundaries text,
  geometry geometry(MultiPolygon,4326),
  research_status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX spaces_geometry_gix ON spaces USING gist(geometry);

CREATE TABLE sectors (
  id text PRIMARY KEY,
  space_id text NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  geometry geometry(Geometry,4326),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sectors_geometry_gix ON sectors USING gist(geometry);

CREATE TABLE users (
  id bigserial PRIMARY KEY,
  email citext UNIQUE NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL CHECK(role IN ('admin','moderator','reviewer')),
  password_hash text NOT NULL,
  password_salt text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contributions (
  code text PRIMARY KEY,
  space_id text NOT NULL REFERENCES spaces(id),
  sector_id text REFERENCES sectors(id),
  description text NOT NULL,
  event_at timestamptz,
  profile text,
  location_text text,
  location geometry(Point,4326),
  preliminary_category text,
  integrity integer CHECK(integrity BETWEEN 0 AND 100),
  missing jsonb NOT NULL DEFAULT '[]',
  flags jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'Pendiente de revisión',
  source_channel text NOT NULL DEFAULT 'web',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contributions_space_idx ON contributions(space_id);
CREATE INDEX contributions_status_idx ON contributions(status);
CREATE INDEX contributions_location_gix ON contributions USING gist(location);

CREATE TABLE evidence (
  id text PRIMARY KEY,
  contribution_code text UNIQUE REFERENCES contributions(code),
  space_id text NOT NULL REFERENCES spaces(id),
  sector_id text REFERENCES sectors(id),
  evidence_type text NOT NULL,
  status text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  event_at timestamptz,
  method text,
  limitations text,
  dimensions jsonb NOT NULL DEFAULT '[]',
  confidence jsonb NOT NULL DEFAULT '{}',
  published_by bigint REFERENCES users(id),
  published_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id bigserial PRIMARY KEY,
  actor_user_id bigint REFERENCES users(id),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL,
  before_state jsonb,
  after_state jsonb,
  note text,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_entity_idx ON audit_log(entity_type,entity_id,created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
  id bigserial PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  csrf_token text NOT NULL,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS contribution_images (
  id bigserial PRIMARY KEY,
  contribution_code text NOT NULL REFERENCES contributions(code) ON DELETE CASCADE,
  filename text NOT NULL,
  mime_type text NOT NULL,
  byte_size bigint NOT NULL,
  storage_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id bigserial PRIMARY KEY,
  contribution_code text NOT NULL REFERENCES contributions(code) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES users(id),
  action text NOT NULL,
  previous_status text,
  new_status text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS moderation_actions_code_idx ON moderation_actions(contribution_code,created_at DESC);

CREATE TABLE IF NOT EXISTS ingestion_sources (
  id text PRIMARY KEY,name text NOT NULL,institution text,type text NOT NULL,url text NOT NULL UNIQUE,
  parser text NOT NULL DEFAULT 'web_page',enabled boolean NOT NULL DEFAULT true,trust text NOT NULL DEFAULT 'media',
  frequency_minutes integer NOT NULL DEFAULT 1440,terms jsonb NOT NULL DEFAULT '[]',last_etag text,last_modified text,
  last_content_hash text,last_checked_at timestamptz,last_success_at timestamptz,next_run_at timestamptz,
  error_count integer NOT NULL DEFAULT 0,last_error text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ingestion_due_idx ON ingestion_sources(enabled,next_run_at);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id bigserial PRIMARY KEY,source_id text NOT NULL REFERENCES ingestion_sources(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL,finished_at timestamptz,status text NOT NULL,http_status integer,changed boolean NOT NULL DEFAULT false,
  new_items integer NOT NULL DEFAULT 0,duplicate_items integer NOT NULL DEFAULT 0,error text,bytes bigint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ingestion_documents (
  id bigserial PRIMARY KEY,source_id text NOT NULL REFERENCES ingestion_sources(id) ON DELETE CASCADE,
  fetched_at timestamptz NOT NULL,url text NOT NULL,http_status integer,etag text,last_modified text,content_type text,
  content_hash text NOT NULL,storage_key text,byte_size bigint NOT NULL,changed boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS ingestion_items (
  id bigserial PRIMARY KEY,source_id text NOT NULL REFERENCES ingestion_sources(id) ON DELETE CASCADE,
  document_id bigint REFERENCES ingestion_documents(id),external_id text,canonical_url text,title text NOT NULL,summary text,
  published_at timestamptz,observed_at timestamptz NOT NULL,space_id text REFERENCES spaces(id),category text,reliability text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente_revision',review_reason text,fingerprint text NOT NULL UNIQUE,raw jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ingestion_items_status_idx ON ingestion_items(status,space_id);

CREATE TABLE IF NOT EXISTS ingestion_review_actions (
  id bigserial PRIMARY KEY,item_id bigint NOT NULL REFERENCES ingestion_items(id) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES users(id),action text NOT NULL,note text,created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingestion_alerts (
  id bigserial PRIMARY KEY,item_id bigint NOT NULL REFERENCES ingestion_items(id) ON DELETE CASCADE,source_id text NOT NULL,
  space_id text REFERENCES spaces(id),alert_type text NOT NULL,severity text NOT NULL,title text NOT NULL,status text NOT NULL DEFAULT 'nueva',
  created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ingestion_alerts_status_idx ON ingestion_alerts(status,severity);

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  wa_id text PRIMARY KEY,state text NOT NULL,data jsonb NOT NULL DEFAULT '{}',last_contribution_code text REFERENCES contributions(code),
  created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id bigserial PRIMARY KEY,wa_id text NOT NULL,direction text NOT NULL CHECK(direction IN ('in','out')),provider_message_id text,
  message_type text NOT NULL,text_content text,payload jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_in_provider_uidx ON whatsapp_messages(provider_message_id) WHERE provider_message_id IS NOT NULL AND direction='in';
CREATE INDEX IF NOT EXISTS whatsapp_messages_wa_idx ON whatsapp_messages(wa_id,created_at);
CREATE TABLE IF NOT EXISTS whatsapp_media (
  id bigserial PRIMARY KEY,wa_id text NOT NULL,provider_media_id text,media_type text NOT NULL,mime_type text,filename text,
  byte_size bigint,storage_key text,transcript text,contribution_code text REFERENCES contributions(code),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS whatsapp_statuses (
  id bigserial PRIMARY KEY,provider_message_id text NOT NULL,status text NOT NULL,recipient_id text,conversation_id text,
  pricing jsonb NOT NULL DEFAULT '{}',errors jsonb NOT NULL DEFAULT '[]',payload jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS whatsapp_status_message_idx ON whatsapp_statuses(provider_message_id,created_at);

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_statuses ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('sv-contributions','sv-contributions',false),
  ('sv-whatsapp','sv-whatsapp',false),
  ('sv-source-documents','sv-source-documents',false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
