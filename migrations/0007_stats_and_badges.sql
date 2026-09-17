-- Listening time, counted per day so a small streak view is possible later.
CREATE TABLE listening_days (
  user_id INTEGER NOT NULL REFERENCES users(id),
  day     TEXT NOT NULL,          -- YYYY-MM-DD in the listener's local time
  seconds REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
CREATE INDEX listening_days_user ON listening_days(user_id, day DESC);

-- Badges are earned once per person. The other profile can be nudged and can cheer back.
CREATE TABLE achievements (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  code          TEXT NOT NULL,
  earned_at     INTEGER NOT NULL,
  seen_at       INTEGER,          -- the earner saw the popup
  shared_at     INTEGER,          -- sent to the other profile
  cheer_from    INTEGER REFERENCES users(id),
  cheer_at      INTEGER,
  cheer_seen_at INTEGER,          -- the earner saw the cheer
  UNIQUE (user_id, code)
);
CREATE INDEX achievements_user ON achievements(user_id, earned_at DESC);
