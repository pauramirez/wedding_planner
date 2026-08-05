-- 0002_resources.sql — the six shared resources

CREATE TABLE tasks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  cat        TEXT NOT NULL CHECK (cat IN ('vancouver','colombia','shared')),
  title      TEXT NOT NULL,
  owner      TEXT NOT NULL DEFAULT 'Both',
  due        TEXT,
  cost       REAL,
  status     TEXT NOT NULL DEFAULT 'todo',
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tasks_cat ON tasks(cat);

CREATE TABLE guests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  side       TEXT NOT NULL DEFAULT 'Both',
  event      TEXT NOT NULL DEFAULT 'Both',
  plus_one   TEXT NOT NULL DEFAULT 'No',
  table_num  TEXT,
  contact    TEXT,
  rsvp       TEXT NOT NULL DEFAULT 'pending',
  meal       TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_guests_event ON guests(event);
CREATE INDEX idx_guests_rsvp ON guests(rsvp);

CREATE TABLE vendors (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  category   TEXT NOT NULL,
  name       TEXT NOT NULL,
  event      TEXT NOT NULL DEFAULT 'Both',
  contact    TEXT,
  price      REAL,
  status     TEXT NOT NULL DEFAULT 'researching',
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vendors_event ON vendors(event);

CREATE TABLE gifts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient  TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'Other',
  idea       TEXT,
  budget     REAL,
  status     TEXT NOT NULL DEFAULT 'idea',
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE palette (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  hex        TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE timeline (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  day        TEXT NOT NULL CHECK (day IN ('van','col')),
  time       TEXT NOT NULL,
  activity   TEXT NOT NULL,
  owner      TEXT NOT NULL DEFAULT 'Both',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_timeline_day ON timeline(day);
