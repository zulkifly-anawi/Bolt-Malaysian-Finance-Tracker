#!/usr/bin/env bash
set -euo pipefail

# Refresh local Supabase DB data from the linked cloud project (public schema only).
# Requirements: supabase CLI and docker.

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
WORKDIR="$ROOT_DIR"
SQL_FILE="$ROOT_DIR/supabase/.temp/cloud_public_data.sql"

echo "[1/4] Ensuring Supabase services are running..."
supabase status --workdir "$WORKDIR" >/dev/null 2>&1 || true

DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^supabase_db_' || true)
if [[ -z "$DB_CONTAINER" ]]; then
  echo "Supabase DB container not found. Starting services..."
  supabase start --workdir "$WORKDIR" >/dev/null
  DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^supabase_db_')
fi

echo "[2/4] Dumping cloud public data to $SQL_FILE ..."
supabase db dump --linked --data-only -s public -f "$SQL_FILE" --workdir "$WORKDIR"

echo "[3/4] Truncating local public tables (RESTART IDENTITY CASCADE)..."
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c $'DO $$\nDECLARE r record;\nBEGIN\n  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = \'public\') LOOP\n    EXECUTE \'TRUNCATE TABLE public.\' || quote_ident(r.tablename) || \' RESTART IDENTITY CASCADE\';\n  END LOOP;\nEND\n$$;'

echo "[4/4] Importing cloud public data into local DB..."
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f - < "$SQL_FILE"

echo "Done. Local database now mirrors cloud public data."
