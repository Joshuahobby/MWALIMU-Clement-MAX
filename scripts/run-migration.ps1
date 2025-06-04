# PowerShell script to apply the database schema to Supabase

# Load environment variables from .env.local
if (Test-Path .env.local) {
    Get-Content .env.local | ForEach-Object {
        if (-not [string]::IsNullOrWhiteSpace($_) -and -not $_.StartsWith('#')) {
            $key, $value = $_ -split '=', 2
            [Environment]::SetEnvironmentVariable($key, $value)
        }
    }
}
else {
    Write-Error "Error: .env.local file not found"
    exit 1
}

# Check if required environment variables are set
if ([string]::IsNullOrWhiteSpace($env:NEXT_PUBLIC_SUPABASE_URL) -or [string]::IsNullOrWhiteSpace($env:SUPABASE_SERVICE_ROLE_KEY)) {
    Write-Error "Error: Missing Supabase environment variables"
    exit 1
}

# Read the migration SQL file
$migrationSql = Get-Content -Path "supabase/migrations/20231101000000_initial_schema.sql" -Raw

# Create a temporary file with the JSON payload
$jsonPayload = @{
    query = $migrationSql
} | ConvertTo-Json

$tempFile = New-TemporaryFile
Set-Content -Path $tempFile.FullName -Value $jsonPayload

# Apply migration using Invoke-RestMethod
Write-Host "Applying migration to Supabase..."
try {
    $headers = @{
        "apikey"        = $env:SUPABASE_SERVICE_ROLE_KEY
        "Authorization" = "Bearer $($env:SUPABASE_SERVICE_ROLE_KEY)"
        "Content-Type"  = "application/json"
    }
    
    # Execute the request without storing the result
    Invoke-RestMethod -Uri "$($env:NEXT_PUBLIC_SUPABASE_URL)/rest/v1/rpc/exec_sql" `
        -Method Post `
        -Headers $headers `
        -InFile $tempFile.FullName
    
    Write-Host "Migration applied successfully!"
    Write-Host "Database schema has been set up with:"
    Write-Host "- users table"
    Write-Host "- payments table"
    Write-Host "- access_codes table"
    Write-Host "- test_sessions table"
    Write-Host "- questions table"
    Write-Host "- Row Level Security policies"
}
catch {
    Write-Error "Error: Failed to apply migration: $_"
    exit 1
}
finally {
    # Delete the temporary file
    Remove-Item -Path $tempFile.FullName
} 