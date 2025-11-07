CREATE TABLE `telegram_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`telegram_id` integer NOT NULL,
	`username` text,
	`first_name` text NOT NULL,
	`last_name` text,
	`language_code` text,
	`locale` text DEFAULT 'en' NOT NULL,
	`is_bot` integer DEFAULT false NOT NULL,
	`is_premium` integer DEFAULT false,
	`is_active` integer DEFAULT true NOT NULL,
	`is_blocked` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`last_interaction_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `telegram_users_telegram_id_unique` ON `telegram_users` (`telegram_id`);