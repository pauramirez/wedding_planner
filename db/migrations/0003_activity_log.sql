-- 0003_activity_log.sql — audit trail: who changed what, when

CREATE TABLE activity_log (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_email     TEXT,
  action         TEXT NOT NULL CHECK (action IN ('create','update','delete')),
  resource_type  TEXT NOT NULL,
  resource_id    INTEGER,
  before_json    TEXT,
  after_json     TEXT,
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_activity_created_at ON activity_log(created_at);
CREATE INDEX idx_activity_resource ON activity_log(resource_type, resource_id);
