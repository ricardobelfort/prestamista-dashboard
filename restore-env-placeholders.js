#!/usr/bin/env node

/**
 * Restore placeholders in environment file
 * This ensures credentials are never committed
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, 'src/environments/environment.ts');

// Read environment file
let content = fs.readFileSync(ENV_FILE, 'utf8');

// Replace any URLs back to placeholder
content = content.replace(
  /supabaseUrl:\s*['"]https:\/\/[^'"]+['"]/g,
  "supabaseUrl: '__SUPABASE_URL__'"
);

// Replace any keys back to placeholder
content = content.replace(
  /supabaseKey:\s*['"]eyJ[^'"]+['"]/g,
  "supabaseKey: '__SUPABASE_KEY__'"
);

// Write back
fs.writeFileSync(ENV_FILE, content, 'utf8');

console.log('✅ Environment placeholders restored');
