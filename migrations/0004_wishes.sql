-- Book wishes: someone asks for a title, the other person fetches it and marks it done.
CREATE TABLE wishes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  author     TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'open',   -- open | done
  created_at INTEGER NOT NULL,
  done_at    INTEGER
);
CREATE INDEX wishes_status ON wishes(status, created_at DESC);
