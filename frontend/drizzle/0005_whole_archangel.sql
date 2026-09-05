ALTER TABLE `evidence` ADD `layer_id` text;--> statement-breakpoint
ALTER TABLE `evidence` ADD `record_type` text;--> statement-breakpoint
ALTER TABLE `evidence` ADD `provider` text;--> statement-breakpoint
ALTER TABLE `evidence` ADD `geographic_scope` text;--> statement-breakpoint
ALTER TABLE `evidence` ADD `updated_at` text;
--> statement-breakpoint
UPDATE `evidence` SET
  `layer_id` = CASE `id`
    WHEN 'ev-etapas' THEN 'history' WHEN 'ev-flujos' THEN 'uses' WHEN 'ev-accesibilidad' THEN 'access'
    WHEN 'ev-cesped' THEN 'uses' WHEN 'ev-canil' THEN 'equipment' WHEN 'ev-luces' THEN 'equipment'
    WHEN 'ev-biodiversidad' THEN 'environment' WHEN 'ev-nativas' THEN 'environment' WHEN 'ev-pastizal' THEN 'environment'
    WHEN 'ev-dganu' THEN 'evaluation' WHEN 'ev-actores' THEN 'governance' WHEN 'ev-voces' THEN 'voices'
    ELSE `layer_id` END,
  `record_type` = CASE `id`
    WHEN 'ev-etapas' THEN 'Antecedente de proyecto' WHEN 'ev-flujos' THEN 'Observación de flujos' WHEN 'ev-accesibilidad' THEN 'Recorrido de accesibilidad'
    WHEN 'ev-cesped' THEN 'Observación de permanencias' WHEN 'ev-canil' THEN 'Inventario de equipamiento' WHEN 'ev-luces' THEN 'Registro horario'
    WHEN 'ev-biodiversidad' THEN 'Hallazgo académico' WHEN 'ev-nativas' THEN 'Antecedente ambiental' WHEN 'ev-pastizal' THEN 'Criterio de mantenimiento'
    WHEN 'ev-dganu' THEN 'Antecedente metodológico' WHEN 'ev-actores' THEN 'Mapa de actores' WHEN 'ev-voces' THEN 'Entrevistas y conversaciones'
    ELSE `record_type` END,
  `provider` = CASE
    WHEN `id` IN ('ev-etapas','ev-dganu') THEN 'GCBA y documentación pública'
    WHEN `id` IN ('ev-biodiversidad','ev-nativas','ev-pastizal') THEN 'Eduardo Haene y equipo'
    WHEN `id` IN ('ev-flujos','ev-accesibilidad','ev-cesped','ev-canil','ev-luces') THEN 'Equipo de investigación · trabajo de campo'
    WHEN `id`='ev-actores' THEN 'Equipo de investigación y fuentes institucionales'
    WHEN `id`='ev-voces' THEN 'Usuarios entrevistados y equipo de investigación'
    ELSE `provider` END,
  `geographic_scope` = CASE
    WHEN `id` IN ('ev-flujos','ev-cesped') THEN 'Sectores recorridos · contraste entre anfiteatro y vagones'
    WHEN `id`='ev-accesibilidad' THEN 'Recorrido principal y accesos a equipamientos'
    WHEN `id`='ev-canil' THEN 'Canil y conexiones próximas'
    WHEN `id`='ev-luces' THEN 'Sectores observados durante el recorrido'
    ELSE 'Parque Ferroviario Colegiales' END,
  `updated_at` = '2026-09-05'
WHERE `space_id`='parque-ferroviario-colegiales';
