-- Favorites live on the per-user/per-book state row.
ALTER TABLE progress ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0;

-- Optional profile picture stored in R2 (avatars/<user id>.jpg).
ALTER TABLE users ADD COLUMN avatar_key TEXT;

-- Profile colours follow the Mr. Nook palette (sage, terracotta).
UPDATE users SET color = '#82855b' WHERE id = 1;
UPDATE users SET color = '#ce6946' WHERE id = 2;
