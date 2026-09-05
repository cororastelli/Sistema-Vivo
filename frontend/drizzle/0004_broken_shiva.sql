CREATE TABLE `contribution_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`contribution_id` text NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `contribution_assets_contribution_idx` ON `contribution_assets` (`contribution_id`);--> statement-breakpoint
ALTER TABLE `contributions` ADD `observed_at` text;--> statement-breakpoint
ALTER TABLE `contributions` ADD `profile` text;--> statement-breakpoint
ALTER TABLE `contributions` ADD `latitude` real;--> statement-breakpoint
ALTER TABLE `contributions` ADD `longitude` real;--> statement-breakpoint
ALTER TABLE `contributions` ADD `category` text;--> statement-breakpoint
ALTER TABLE `contributions` ADD `completeness` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `contributions` ADD `moderation_note` text;