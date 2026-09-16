-- Where the sleep timer last stopped playback, so you can find the spot again.
ALTER TABLE progress ADD COLUMN sleep_sec REAL;

-- Shared reviews. One per person and book, and only for books that person finished.
CREATE TABLE reviews (
  user_id    INTEGER NOT NULL REFERENCES users(id),
  book_id    TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text       TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, book_id)
);
CREATE INDEX reviews_book ON reviews(book_id);
CREATE INDEX reviews_recent ON reviews(updated_at DESC);
