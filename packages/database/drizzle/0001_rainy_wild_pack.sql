CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text DEFAULT 'local' NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`artist` text DEFAULT '' NOT NULL,
	`album` text DEFAULT '' NOT NULL,
	`artwork` text,
	`url` text NOT NULL,
	`duration` real DEFAULT 0 NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT 0 NOT NULL,
	`modified_at` integer DEFAULT 0 NOT NULL,
	`bitrate` integer,
	`sample_rate` integer,
	`channels` integer,
	`format` text,
	`year` integer,
	`genre` text,
	`track` integer,
	`disc` integer,
	`composer` text,
	`lyricist` text,
	`lyrics` text,
	`album_artist` text,
	`comment` text,
	`sort_key` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tracks_title_idx` ON `tracks` (`title`);--> statement-breakpoint
CREATE INDEX `tracks_artist_idx` ON `tracks` (`artist`);--> statement-breakpoint
CREATE INDEX `tracks_album_idx` ON `tracks` (`album`);--> statement-breakpoint
CREATE INDEX `tracks_created_at_idx` ON `tracks` (`created_at`);--> statement-breakpoint
CREATE INDEX `tracks_sort_key_idx` ON `tracks` (`sort_key`);