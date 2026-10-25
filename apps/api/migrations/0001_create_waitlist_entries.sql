CREATE TABLE IF NOT EXISTS waitlist_entries (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website',
  user_agent TEXT,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created_at
  ON waitlist_entries (created_at);

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_platform
  ON waitlist_entries (platform);
