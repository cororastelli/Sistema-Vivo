CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`channel` text DEFAULT 'web' NOT NULL,
	`text` text NOT NULL,
	`sector` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `contributions_space_idx` ON `contributions` (`space_id`);--> statement-breakpoint
CREATE TABLE `evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`stage` text NOT NULL,
	`period` text NOT NULL,
	`coverage` integer NOT NULL,
	`score` real,
	`note` text NOT NULL,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`source_id` text,
	`title` text NOT NULL,
	`detail` text NOT NULL,
	`dimension` text NOT NULL,
	`state` text NOT NULL,
	`method` text NOT NULL,
	`limitation` text,
	`observed_at` text,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `evidence_space_idx` ON `evidence` (`space_id`);--> statement-breakpoint
CREATE TABLE `issues` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`title` text NOT NULL,
	`statement` text NOT NULL,
	`status` text NOT NULL,
	`affected_actors` text NOT NULL,
	`evidence_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`title` text NOT NULL,
	`publisher` text NOT NULL,
	`kind` text NOT NULL,
	`url` text,
	`published_at` text,
	`checked_at` text NOT NULL,
	`reliability` text NOT NULL,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sources_space_idx` ON `sources` (`space_id`);--> statement-breakpoint
CREATE TABLE `spaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`neighborhood` text NOT NULL,
	`commune` integer NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'catalog' NOT NULL,
	`description` text NOT NULL,
	`source_label` text,
	`source_url` text,
	`source_updated_at` text,
	`latitude` real,
	`longitude` real
);
--> statement-breakpoint
CREATE INDEX `spaces_commune_idx` ON `spaces` (`commune`);
--> statement-breakpoint
INSERT INTO `spaces` (`id`,`name`,`neighborhood`,`commune`,`type`,`status`,`description`,`source_label`,`source_url`,`source_updated_at`) VALUES
('parque-ferroviario-colegiales','Parque Ferroviario Colegiales','Colegiales',13,'Parque','case-study','Caso testigo desarrollado: un parque construido por etapas sobre suelo ferroviario, con fuentes documentales, observación y evaluación en proceso.','Buenos Aires Data · Espacios verdes','https://data.buenosaires.gob.ar/dataset/espacios-verdes','2026-07-06'),
('parque-de-la-estacion','Parque de la Estación','Balvanera',3,'Parque','reference','Caso de referencia para gestión participativa, recuperación ferroviaria y construcción de programas con la comunidad.','Catálogo preliminar','https://buenosaires.gob.ar/',NULL),
('parque-saavedra','Parque Saavedra','Saavedra',12,'Parque','catalog','Registro preliminar. Todavía no cuenta con una investigación completa dentro de Sistema Vivo.','Catálogo preliminar','https://data.buenosaires.gob.ar/dataset/espacios-verdes',NULL);
--> statement-breakpoint
INSERT INTO `sources` (`id`,`space_id`,`title`,`publisher`,`kind`,`url`,`checked_at`,`reliability`) VALUES
('src-ba-verdes','parque-ferroviario-colegiales','Espacios verdes','Buenos Aires Data','dataset','https://data.buenosaires.gob.ar/dataset/espacios-verdes','2026-09-04','oficial');
--> statement-breakpoint
INSERT INTO `evidence` (`id`,`space_id`,`source_id`,`title`,`detail`,`dimension`,`state`,`method`,`limitation`,`observed_at`) VALUES
('ev-etapas','parque-ferroviario-colegiales','src-ba-verdes','El parque fue construido por etapas','La lectura del proyecto exige comparar antecedentes, obra ejecutada y funcionamiento actual; no puede tratarse como una pieza única y cerrada.','Historia y proyecto','validada','Documentación pública','Falta incorporar la totalidad de los planos conforme a obra.',NULL),
('ev-flujos','parque-ferroviario-colegiales',NULL,'La permanencia no se distribuye de forma homogénea','Durante cinco recorridos de fin de semana se observó mayor concentración cerca del anfiteatro y menor permanencia en el sector de vagones.','Usos y flujos','contextual','Observación de campo · 17 a 19 h','Un solo día no permite generalizar el comportamiento anual ni semanal.','2026-08-30'),
('ev-accesibilidad','parque-ferroviario-colegiales',NULL,'La accesibilidad no es continua','El recorrido principal es transitable, pero aparecen desniveles, bordes y equipamientos con accesos diferentes entre sí.','Accesibilidad y cuidados','contextual','Recorrido acompañado por una persona mayor con bastón','Debe contrastarse con auditoría técnica y otros perfiles de movilidad.','2026-08-30');
--> statement-breakpoint
INSERT INTO `issues` (`id`,`space_id`,`title`,`statement`,`status`,`affected_actors`,`evidence_count`) VALUES
('issue-continuidad','parque-ferroviario-colegiales','La evidencia no continúa hasta la decisión','Planos, reclamos, voces, observaciones y evaluaciones existen, pero permanecen separados. Así se dificulta reconocer relaciones, responsables y oportunidades comunes.','en investigación','Usuarios cotidianos, organizaciones, equipos técnicos y organismos responsables',3);
--> statement-breakpoint
INSERT INTO `evaluations` (`id`,`space_id`,`stage`,`period`,`coverage`,`score`,`note`) VALUES
('eval-ante','parque-ferroviario-colegiales','Ex-ante','2017–2024',47,NULL,'Cobertura documental vinculada. No equivale al resultado del parque.'),
('eval-post','parque-ferroviario-colegiales','Ex-post','2024–2026',100,NULL,'Carga informada como completa; el puntaje permanece bloqueado hasta validar respuestas obligatorias.'),
('eval-expectativa','parque-ferroviario-colegiales','Expectativa','Próxima intervención',0,NULL,'Se habilita cuando existe una propuesta medible y permite volver a evaluar después de implementarla.');
