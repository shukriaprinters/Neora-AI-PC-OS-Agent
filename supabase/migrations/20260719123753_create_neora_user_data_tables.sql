-- Neora user data persistence: tasks, reminders, notes
-- No-auth app: anon key client reads/writes its own rows keyed by a local device_id.

CREATE TABLE IF NOT EXISTS neora_tasks (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_at TEXT DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  tags JSONB DEFAULT '[]'::jsonb,
  completed_at TEXT DEFAULT '',
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_at TEXT DEFAULT '',
  category TEXT DEFAULT '',
  created_at TEXT DEFAULT '',
  attachment TEXT DEFAULT '',
  sub_tasks JSONB DEFAULT '[]'::jsonb,
  recurring TEXT DEFAULT 'none',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS neora_reminders (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  title TEXT NOT NULL,
  remind_at TEXT NOT NULL,
  repeat TEXT NOT NULL DEFAULT 'none',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS neora_notes (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  created_at TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_neora_tasks_device ON neora_tasks(device_id);
CREATE INDEX IF NOT EXISTS idx_neora_reminders_device ON neora_reminders(device_id);
CREATE INDEX IF NOT EXISTS idx_neora_notes_device ON neora_notes(device_id);

ALTER TABLE neora_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE neora_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE neora_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_tasks" ON neora_tasks FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_tasks" ON neora_tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_tasks" ON neora_tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_tasks" ON neora_tasks FOR DELETE
  TO anon, authenticated USING (true);

CREATE POLICY "select_own_reminders" ON neora_reminders FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_reminders" ON neora_reminders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_reminders" ON neora_reminders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_reminders" ON neora_reminders FOR DELETE
  TO anon, authenticated USING (true);

CREATE POLICY "select_own_notes" ON neora_notes FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_notes" ON neora_notes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_notes" ON neora_notes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_notes" ON neora_notes FOR DELETE
  TO anon, authenticated USING (true);
