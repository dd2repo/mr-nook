-- "When I set the timer" is a poor guess at "the last thing I took in". These record the
-- last sign of life instead: the last time the screen was touched, and the moment the
-- phone went dark, both as a position in the book and as a wall clock time.
ALTER TABLE sleep_sessions ADD COLUMN awake_sec REAL;
ALTER TABLE sleep_sessions ADD COLUMN awake_at INTEGER;
ALTER TABLE sleep_sessions ADD COLUMN hidden_sec REAL;
ALTER TABLE sleep_sessions ADD COLUMN hidden_at INTEGER;
