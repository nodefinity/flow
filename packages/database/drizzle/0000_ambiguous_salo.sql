CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist_id` text,
	`artwork` text,
	`year` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `album_title_idx` ON `albums` (`title`);--> statement-breakpoint
CREATE INDEX `album_artist_idx` ON `albums` (`artist_id`);--> statement-breakpoint
CREATE TABLE `artists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`artwork` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `artist_name_idx` ON `artists` (`name`);--> statement-breakpoint
CREATE TABLE `playlist_tracks` (
	`playlist_id` text NOT NULL,
	`track_id` text NOT NULL,
	`position` integer NOT NULL,
	`added_at` integer NOT NULL,
	PRIMARY KEY(`playlist_id`, `track_id`),
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `playlist_tracks_playlist_idx` ON `playlist_tracks` (`playlist_id`);--> statement-breakpoint
CREATE INDEX `playlist_tracks_track_idx` ON `playlist_tracks` (`track_id`);--> statement-breakpoint
CREATE INDEX `playlist_tracks_position_idx` ON `playlist_tracks` (`position`);--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`artwork` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `playlist_name_idx` ON `playlists` (`name`);--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist_id` text,
	`album_id` text,
	`duration` integer,
	`url` text NOT NULL,
	`artwork` text,
	`source` text NOT NULL,
	`local_id` text,
	`file_path` text,
	`file_size` integer,
	`bitrate` integer,
	`sample_rate` integer,
	`channels` integer,
	`format` text,
	`year` integer,
	`genre` text,
	`track_number` integer,
	`disc_number` integer,
	`composer` text,
	`lyricist` text,
	`lyrics` text,
	`album_artist` text,
	`comment` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `track_title_idx` ON `tracks` (`title`);--> statement-breakpoint
CREATE INDEX `track_artist_idx` ON `tracks` (`artist_id`);--> statement-breakpoint
CREATE INDEX `track_album_idx` ON `tracks` (`album_id`);--> statement-breakpoint
CREATE INDEX `track_source_idx` ON `tracks` (`source`);--> statement-breakpoint
CREATE INDEX `track_local_id_idx` ON `tracks` (`local_id`);