-- A single marker was not enough: you want to see where you were still awake and how far
-- the timer carried on, so each sleep timer run is recorded as a span.
DROP INDEX IF EXISTS reviews_recent;
ALTER TABLE progress DROP COLUMN sleep_sec;
CREATE INDEX reviews_recent ON reviews(updated_at DESC);

CREATE TABLE sleep_sessions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  book_id      TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  started_sec  REAL NOT NULL,   -- position when the timer was set: you were still awake here
  stopped_sec  REAL NOT NULL,   -- position when it paused playback
  kind         TEXT NOT NULL DEFAULT 'timer',  -- timer | chapter
  started_at   INTEGER NOT NULL,
  stopped_at   INTEGER NOT NULL
);
CREATE INDEX sleep_sessions_user_book ON sleep_sessions(user_id, book_id, stopped_at DESC);
