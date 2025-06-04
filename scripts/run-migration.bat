@echo off
setlocal EnableDelayedExpansion

REM Check if .env.local exists
if not exist .env.local (
  echo Error: .env.local file not found
  exit /b 1
)

REM Load environment variables from .env.local
for /F "tokens=*" %%A in (.env.local) do (
  set line=%%A
  if not "!line:~0,1!"=="#" (
    if not "!line!"=="" (
      set !line!
    )
  )
)

REM Check if required environment variables are set
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
  echo Error: Missing NEXT_PUBLIC_SUPABASE_URL environment variable
  exit /b 1
)

if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
  echo Error: Missing SUPABASE_SERVICE_ROLE_KEY environment variable
  exit /b 1
)

REM Apply migration using curl
echo Applying migration to Supabase...

REM Create a temporary file with the SQL content
type supabase\migrations\20231101000000_initial_schema.sql > temp_migration.sql

REM Use curl to send the request
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/exec_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "@temp_migration.sql"

REM Delete the temporary file
del temp_migration.sql

if %ERRORLEVEL% EQU 0 (
  echo Migration applied successfully!
  echo Database schema has been set up with:
  echo - users table
  echo - payments table
  echo - access_codes table
  echo - test_sessions table
  echo - questions table
  echo - Row Level Security policies
) else (
  echo Error: Failed to apply migration
  exit /b 1
)

endlocal 