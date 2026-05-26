CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  caption TEXT NOT NULL,
  era TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_created ON photos(created_at DESC);
