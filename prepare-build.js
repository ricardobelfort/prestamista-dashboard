#!/usr/bin/env node

/**
 * Prepare environment files for production build
 * 
 * This script replaces real credentials with placeholders in environment files
 * BEFORE building, so the build contains only placeholders that will be
 * replaced with actual environment variables at deploy time.
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, 'src/environments/environment.prod.ts');

console.log('🔧 Preparing environment files for production build...\n');

// Read the production environment file
let content = fs.readFileSync(ENV_FILE, 'utf8');

// Replace any hardcoded credentials with placeholders
content = content.replace(
  /supabaseUrl:\s*['"]https:\/\/[^'"]+['"]/g,
  "supabaseUrl: '__SUPABASE_URL__'"
);

content = content.replace(
  /supabaseKey:\s*['"]eyJ[^'"]+['"]/g,
  "supabaseKey: '__SUPABASE_KEY__'"
);

// Write back
fs.writeFileSync(ENV_FILE, content, 'utf8');

console.log('✅ Environment files prepared for build');
console.log('   Placeholders will be replaced at deploy time\n');
