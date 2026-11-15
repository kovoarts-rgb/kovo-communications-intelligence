-- Isolated Kovo Communications Intelligence signaling, no call content.
CREATE TABLE IF NOT EXISTS kci_rooms (
 id TEXT PRIMARY KEY NOT NULL,
 version INTEGER NOT NULL DEFAULT 0,
 expires_at INTEGER NOT NULL,
 data TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS kci_rooms_expiry ON kci_rooms(expires_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS kci_limits (
 id INTEGER PRIMARY KEY CHECK(id=1),
 window_start INTEGER NOT NULL,
 count INTEGER NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO kci_limits(id,window_start,count) VALUES(1,0,0);
