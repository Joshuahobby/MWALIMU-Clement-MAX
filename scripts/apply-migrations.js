// This script applies the database migrations to Supabase
// Run with: node scripts/apply-migrations.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationFilePath = path.join(__dirname, '../supabase/migrations/20231101000000_initial_schema.sql');
const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. Make sure .env.local is set up correctly.');
    process.exit(1);
  }
  
  console.log('Applying migration to Supabase...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        query: migrationSql
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to apply migration: ${error}`);
    }
    
    console.log('Migration applied successfully!');
    console.log('Database schema has been set up with:');
    console.log('- users table');
    console.log('- payments table');
    console.log('- access_codes table');
    console.log('- test_sessions table');
    console.log('- questions table');
    console.log('- Row Level Security policies');
    
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const envVars = envFile.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  for (const line of envVars) {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  }
}

applyMigration(); 