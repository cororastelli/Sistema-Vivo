BEGIN;

ALTER TABLE public.ingestion_runs ADD COLUMN IF NOT EXISTS updated_items integer NOT NULL DEFAULT 0;
ALTER TABLE public.ingestion_runs ADD COLUMN IF NOT EXISTS missing_items integer NOT NULL DEFAULT 0;
ALTER TABLE public.ingestion_runs ADD COLUMN IF NOT EXISTS stats jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS sv_core_spaces_official_id_uidx ON sv_core.spaces (official_id) WHERE official_id IS NOT NULL;

INSERT INTO public.ingestion_sources
  (id,name,institution,type,url,parser,enabled,trust,frequency_minutes,next_run_at)
VALUES ('ba-green-spaces-public','Espacios verdes públicos','Buenos Aires Data','dataset',
  'https://data.buenosaires.gob.ar/dataset/espacios-verdes/resource/2a9af960-02a3-44bb-b57e-0a8295f6e0e2/download',
  'geojson_green_spaces',true,'primary',1440,now())
ON CONFLICT (id) DO UPDATE SET
  name=excluded.name,institution=excluded.institution,type=excluded.type,url=excluded.url,
  parser=excluded.parser,enabled=true,trust=excluded.trust,frequency_minutes=excluded.frequency_minutes,updated_at=now();

CREATE OR REPLACE FUNCTION public.sv_ingest_green_spaces(p_rows jsonb, p_metadata jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_total integer; v_new integer; v_updated integer; v_missing integer; v_unchanged integer;
  v_now timestamptz := now(); v_source_id text := p_metadata->>'source_id';
BEGIN
  IF jsonb_typeof(p_rows) <> 'array' THEN RAISE EXCEPTION 'Rows must be an array'; END IF;
  IF v_source_id <> 'ba-green-spaces-public' THEN RAISE EXCEPTION 'Unknown source'; END IF;

  CREATE TEMP TABLE pg_temp.sv_green_spaces_stage (
    official_id text PRIMARY KEY,name text NOT NULL,neighborhood text NOT NULL,commune integer NOT NULL,
    type text NOT NULL,source_label text NOT NULL,source_url text NOT NULL,source_updated_at text NOT NULL,
    location text,area_sqm double precision,latitude double precision,longitude double precision
  ) ON COMMIT DROP;
  INSERT INTO pg_temp.sv_green_spaces_stage
  SELECT x.official_id,x.name,x.neighborhood,x.commune,x.type,x.source_label,x.source_url,x.source_updated_at,
         x.location,x.area_sqm,x.latitude,x.longitude
  FROM jsonb_to_recordset(p_rows) AS x(
    official_id text,name text,neighborhood text,commune integer,type text,source_label text,source_url text,
    source_updated_at text,location text,area_sqm double precision,latitude double precision,longitude double precision
  );

  SELECT count(*) INTO v_total FROM pg_temp.sv_green_spaces_stage;
  IF v_total < 1000 THEN RAISE EXCEPTION 'Official dataset is unexpectedly small: %', v_total; END IF;
  IF EXISTS (SELECT 1 FROM pg_temp.sv_green_spaces_stage WHERE commune NOT BETWEEN 1 AND 15 OR latitude NOT BETWEEN -35 AND -34 OR longitude NOT BETWEEN -59 AND -57.5)
    THEN RAISE EXCEPTION 'Official dataset contains invalid geography'; END IF;

  SELECT count(*) FILTER (WHERE s.id IS NULL),
         count(*) FILTER (WHERE s.id IS NOT NULL AND
           (s.name,s.neighborhood,s.commune,s.type,s.source_label,s.source_url,s.source_updated_at,s.location,s.area_sqm,s.latitude,s.longitude)
           IS DISTINCT FROM
           (t.name,t.neighborhood,t.commune,t.type,t.source_label,t.source_url,t.source_updated_at,t.location,t.area_sqm,t.latitude,t.longitude))
  INTO v_new,v_updated
  FROM pg_temp.sv_green_spaces_stage t LEFT JOIN sv_core.spaces s ON s.official_id=t.official_id;

  SELECT count(*) INTO v_missing FROM sv_core.spaces s
  WHERE s.official_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_temp.sv_green_spaces_stage t WHERE t.official_id=s.official_id);
  v_unchanged := v_total-v_new-v_updated;

  INSERT INTO sv_core.spaces
    (id,name,neighborhood,commune,type,status,description,source_label,source_url,source_updated_at,official_id,location,area_sqm,latitude,longitude)
  SELECT coalesce(s.id,'oficial-'||t.official_id),t.name,t.neighborhood,t.commune,t.type,
         coalesce(s.status,'catalog'),coalesce(s.description,'Registro oficial básico. Pendiente de investigación territorial y vinculación de nuevas fuentes.'),
         t.source_label,t.source_url,t.source_updated_at,t.official_id,t.location,t.area_sqm,t.latitude,t.longitude
  FROM pg_temp.sv_green_spaces_stage t LEFT JOIN sv_core.spaces s ON s.official_id=t.official_id
  ON CONFLICT (id) DO UPDATE SET
    name=excluded.name,neighborhood=excluded.neighborhood,commune=excluded.commune,type=excluded.type,
    source_label=excluded.source_label,source_url=excluded.source_url,source_updated_at=excluded.source_updated_at,
    official_id=excluded.official_id,location=excluded.location,area_sqm=excluded.area_sqm,latitude=excluded.latitude,longitude=excluded.longitude;

  UPDATE public.ingestion_sources SET
    last_etag=p_metadata->>'etag',last_modified=p_metadata->>'last_modified',last_content_hash=p_metadata->>'content_hash',
    last_checked_at=v_now,last_success_at=v_now,next_run_at=v_now+interval '1 day',error_count=0,last_error=NULL,updated_at=v_now
  WHERE id=v_source_id;
  INSERT INTO public.ingestion_documents
    (source_id,fetched_at,url,http_status,etag,last_modified,content_type,content_hash,storage_key,byte_size,changed)
  VALUES (v_source_id,coalesce((p_metadata->>'fetched_at')::timestamptz,v_now),p_metadata->>'final_url',
    (p_metadata->>'http_status')::integer,p_metadata->>'etag',p_metadata->>'last_modified',p_metadata->>'content_type',
    p_metadata->>'content_hash',p_metadata->>'storage_key',(p_metadata->>'byte_size')::bigint,coalesce((p_metadata->>'changed')::boolean,false));
  INSERT INTO public.ingestion_runs
    (source_id,started_at,finished_at,status,http_status,changed,new_items,updated_items,duplicate_items,missing_items,bytes,stats)
  VALUES (v_source_id,coalesce((p_metadata->>'started_at')::timestamptz,v_now),v_now,'success',
    (p_metadata->>'http_status')::integer,coalesce((p_metadata->>'changed')::boolean,false),v_new,v_updated,v_unchanged,v_missing,
    (p_metadata->>'byte_size')::bigint,jsonb_build_object('total',v_total,'new',v_new,'updated',v_updated,
    'unchanged',v_unchanged,'missing',v_missing,'source_updated_at',p_metadata->>'source_updated_at'));
  RETURN jsonb_build_object('total',v_total,'new',v_new,'updated',v_updated,'unchanged',v_unchanged,'missing',v_missing,
    'sourceUpdatedAt',p_metadata->>'source_updated_at');
END;
$$;

CREATE OR REPLACE FUNCTION public.sv_ingestion_record_failure(p_source_id text, p_error text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_now timestamptz := now();
BEGIN
  UPDATE public.ingestion_sources SET last_checked_at=v_now,next_run_at=v_now+interval '1 day',
    error_count=error_count+1,last_error=left(p_error,1000),updated_at=v_now WHERE id=p_source_id;
  INSERT INTO public.ingestion_runs(source_id,started_at,finished_at,status,error)
  VALUES(p_source_id,v_now,v_now,'failed',left(p_error,1000));
END;
$$;

REVOKE ALL ON FUNCTION public.sv_ingest_green_spaces(jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sv_ingest_green_spaces(jsonb,jsonb) TO service_role;
REVOKE ALL ON FUNCTION public.sv_ingestion_record_failure(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sv_ingestion_record_failure(text,text) TO service_role;
COMMIT;
