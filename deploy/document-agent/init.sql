-- Esquema inicial para memoria del agente (servidor). La app Angular sigue usando IndexedDB
-- hasta que exista un servicio de sincronización.

CREATE TABLE IF NOT EXISTS agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_user_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Usuario',
  preferences_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES agent_profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_memory_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES agent_profiles (id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_skills_profile ON agent_user_skills (profile_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_profile ON agent_memory_notes (profile_id, created_at DESC);
