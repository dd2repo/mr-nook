-- Between two people the sentence matters more than the number, so a note may stand alone.
-- SQLite cannot relax a CHECK in place, so the table is rebuilt.
CREATE TABLE reviews_new (
  user_id    INTEGER NOT NULL REFERENCES users(id),
  book_id    TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rating     INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  text       TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, book_id)
);
INSERT INTO reviews_new SELECT user_id, book_id, rating, text, created_at, updated_at FROM reviews;
DROP TABLE reviews;
ALTER TABLE reviews_new RENAME TO reviews;
CREATE INDEX reviews_book ON reviews(book_id);
CREATE INDEX reviews_recent ON reviews(updated_at DESC);
