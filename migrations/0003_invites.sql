-- Single-use invite links. The token is the only thing handed out; redeeming it
-- sets the same access cookie the secret link sets. No personal data is stored.
CREATE TABLE invites (
  token      TEXT PRIMARY KEY,
  label      TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at    INTEGER,
  used_agent TEXT
);
CREATE INDEX invites_created ON invites(created_at DESC);
