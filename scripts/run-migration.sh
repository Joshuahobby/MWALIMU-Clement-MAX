#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
else
  echo "Error: .env.local file not found"
  exit 1
fi

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Missing Supabase environment variables"
  exit 1
fi

# Read the migration SQL file
MIGRATION_SQL=$(cat supabase/migrations/20231101000000_initial_schema.sql)

# Apply migration using curl
echo "Applying migration to Supabase..."
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${MIGRATION_SQL}\"}"

if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
  echo "Database schema has been set up with:"
  echo "- users table"
  echo "- payments table"
  echo "- access_codes table"
  echo "- test_sessions table"
  echo "- questions table"
  echo "- Row Level Security policies"
else
  echo "Error: Failed to apply migration"
  exit 1
fi 