CREATE TABLE `entity_links` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`from_type` text NOT NULL,
	`from_id` text NOT NULL,
	`to_type` text NOT NULL,
	`to_id` text NOT NULL,
	`relation` text NOT NULL,
	`evidence_state` text NOT NULL,
	`note` text,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `entity_links_space_idx` ON `entity_links` (`space_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`source_id` text,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`period` text,
	`status` text NOT NULL,
	`scope` text NOT NULL,
	`evidence_state` text NOT NULL,
	`limitation` text,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `projects_space_idx` ON `projects` (`space_id`);--> statement-breakpoint
CREATE TABLE `regulations` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`source_id` text,
	`title` text NOT NULL,
	`authority` text NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`applies_to` text NOT NULL,
	`evidence_state` text NOT NULL,
	`limitation` text,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `regulations_space_idx` ON `regulations` (`space_id`);--> statement-breakpoint
CREATE TABLE `stakeholders` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`source_id` text,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`role` text NOT NULL,
	`responsibility` text NOT NULL,
	`evidence_state` text NOT NULL,
	`limitation` text,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stakeholders_space_idx` ON `stakeholders` (`space_id`);
--> statement-breakpoint
INSERT OR IGNORE INTO `stakeholders` (`id`,`space_id`,`source_id`,`name`,`category`,`role`,`responsibility`,`evidence_state`,`limitation`) VALUES
('actor-usuarios-colegiales','parque-ferroviario-colegiales',NULL,'Usuarios cotidianos','Comunidad','Usan, atraviesan, permanecen y experimentan el parque','Aportan observaciones situadas, necesidades, conflictos y evaluación de uso','contextual','Los perfiles y horarios relevados todavía no constituyen una muestra representativa.'),
('actor-organizaciones-colegiales','parque-ferroviario-colegiales',NULL,'Organizaciones y colectivos barriales','Comunidad organizada','Producen memoria, reclamos, propuestas y seguimiento territorial','Pueden sostener participación y control ciudadano a través del tiempo','contextual','Falta identificar organizaciones vigentes, representantes y alcance actual.'),
('actor-gcba-comuna13','parque-ferroviario-colegiales',NULL,'GCBA y Comuna 13','Sector público local','Intervienen en planificación, espacio público, mantenimiento y programación','Las competencias deben vincularse por organismo y por tipo de decisión','competencias por verificar','No debe atribuirse una responsabilidad específica sin organigrama, contrato o respuesta oficial vigente.'),
('actor-ferroviarios-nacion','parque-ferroviario-colegiales',NULL,'Organismos ferroviarios y nacionales','Sector público nacional','Intervienen sobre suelo, operación ferroviaria, cruces y material asociado','Deben incorporarse cuando una situación excede la competencia urbana local','competencias por verificar','Falta confirmar dominio y competencia actual para cada parcela, estructura y elemento ferroviario.');
--> statement-breakpoint
INSERT OR IGNORE INTO `projects` (`id`,`space_id`,`source_id`,`name`,`kind`,`period`,`status`,`scope`,`evidence_state`,`limitation`) VALUES
('project-etapas-colegiales','parque-ferroviario-colegiales',NULL,'Transformación por etapas del Parque Ferroviario Colegiales','Proyecto y obra','2017–2024','Construido por etapas','Recuperación y transformación de sectores ferroviarios como espacio público','documentada con faltantes','Falta vincular la totalidad de planos aprobados, modificaciones y documentación conforme a obra por sector.');
--> statement-breakpoint
INSERT OR IGNORE INTO `entity_links` (`id`,`space_id`,`from_type`,`from_id`,`to_type`,`to_id`,`relation`,`evidence_state`,`note`) VALUES
('link-usuarios-proyecto','parque-ferroviario-colegiales','actor','actor-usuarios-colegiales','proyecto','project-etapas-colegiales','usan y permiten evaluar el funcionamiento posterior','contextual','La experiencia debe diferenciarse por perfil, horario, actividad y sector.'),
('link-organizaciones-proyecto','parque-ferroviario-colegiales','actor','actor-organizaciones-colegiales','proyecto','project-etapas-colegiales','realizan seguimiento, reclamos y propuestas','por completar','Falta vincular registros y organizaciones específicas.'),
('link-gcba-proyecto','parque-ferroviario-colegiales','actor','actor-gcba-comuna13','proyecto','project-etapas-colegiales','planifica, ejecuta, mantiene o programa según competencia','por verificar','La relación debe desagregarse por área, contrato y período.'),
('link-proyecto-problema','parque-ferroviario-colegiales','proyecto','project-etapas-colegiales','problema','issue-continuidad','produce antecedentes que deben compararse con el funcionamiento posterior','documentada con faltantes','Falta completar la trazabilidad entre cada etapa, evidencia ex-post y decisión posterior.');
