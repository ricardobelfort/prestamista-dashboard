#!/usr/bin/env node

/**
 * Replace environment placeholders in development environment file
 * This runs BEFORE ng serve to ensure credentials are available locally
 */

const fs = require('fs');
const path = require('path');

// Load .env file
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found!');
    console.error('');
    console.error('Please create a .env file with:');
    console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.error('  VITE_SUPABASE_KEY=your-anon-key');
    console.error('');
    console.error('You can copy .env.example as a template.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.trim().startsWith('#') || line.trim() === '') continue;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFile();

const ENV_FILE = path.join(__dirname, 'src/environments/environment.ts');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing environment variables in .env file');
  process.exit(1);
}

// Read environment file
let content = fs.readFileSync(ENV_FILE, 'utf8');

// Replace placeholders
content = content.replace(/__SUPABASE_URL__/g, SUPABASE_URL);
content = content.replace(/__SUPABASE_KEY__/g, SUPABASE_KEY);

// Write back
fs.writeFileSync(ENV_FILE, content, 'utf8');

console.log('✅ Development environment configured from .env file\n');
