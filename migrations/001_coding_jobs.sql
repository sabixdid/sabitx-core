CREATE TABLE IF NOT EXISTS sabitx_coding_jobs (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  state text NOT NULL CHECK (state IN ('preparing','review','executing','succeeded','failed','cancelled')),
  document jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sabitx_coding_jobs_owner_created ON sabitx_coding_jobs (owner_id, created_at DESC);
CREATE TABLE IF NOT EXISTS sabitx_coding_limits (
  owner_id text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  count integer NOT NULL
);
