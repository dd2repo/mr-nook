-- Users are fixed profiles, no authentication (access is guarded by the shared APP_KEY).
CREATE TABLE users (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  lang  TEXT NOT NULL DEFAULT 'de'
);
INSERT INTO users (id, name, color, lang) VALUES
  (1, 'Yannick', '#ff7a1a', 'de'),
  (2, 'Katie',   '#3ea6ff', 'de');

-- One row per audiobook. The audio is a single continuous file in R2.
CREATE TABLE books (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  author       TEXT,
  duration_sec REAL NOT NULL DEFAULT 0,
  size_bytes   INTEGER,
  audio_key    TEXT NOT NULL,
  cover_key    TEXT,
  created_at   INTEGER NOT NULL
);

-- Optional chapter marks (read from ID3 CHAP frames at upload time, or set later).
CREATE TABLE chapters (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id   TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  idx       INTEGER NOT NULL,
  title     TEXT,
  start_sec REAL NOT NULL
);
CREATE INDEX chapters_book ON chapters(book_id, idx);

-- Listening position per user and book (synced across devices).
CREATE TABLE progress (
  user_id      INTEGER NOT NULL REFERENCES users(id),
  book_id      TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position_sec REAL NOT NULL DEFAULT 0,
  finished     INTEGER NOT NULL DEFAULT 0,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE bookmarks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  book_id      TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position_sec REAL NOT NULL,
  note         TEXT NOT NULL DEFAULT '',
  created_at   INTEGER NOT NULL
);
CREATE INDEX bookmarks_user_book ON bookmarks(user_id, book_id, position_sec);
