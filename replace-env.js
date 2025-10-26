#!/usr/bin/env node

/**
 * Replace environment variable placeholders in built files
 * 
 * This script replaces placeholder values in environment files with actual
 * environment variables at build time. This is crucial for security as it
 * prevents hardcoding sensitive credentials in the repository.
 * 
 * Required environment variables:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_KEY: Your Supabase anon/public key
 * 
 * Usage:
 *   node replace-env.js
 * 
 * This script is automatically run during the build process.
 */

const fs = require('fs');
const path = require('path');

// Load .env file if it exists (for local development)
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || line.trim() === '') {
        continue;
      }
      
      // Parse KEY=VALUE
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        
        // Only set if not already in environment
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    
    console.log('✓ Loaded environment variables from .env file\n');
  }
}

// Environment variable names
const ENV_VARS = {
  SUPABASE_URL: 'VITE_SUPABASE_URL',
  SUPABASE_KEY: 'VITE_SUPABASE_KEY',
};

// Placeholders to replace
const PLACEHOLDERS = {
  SUPABASE_URL: '__SUPABASE_URL__',
  SUPABASE_KEY: '__SUPABASE_KEY__',
};

/**
 * Read environment variable with validation
 */
function getEnvVar(name) {
  const value = process.env[name];
  
  if (!value) {
    console.error(`❌ Error: Environment variable ${name} is not set.`);
    console.error('');
    console.error('Required environment variables:');
    console.error('  - VITE_SUPABASE_URL: Your Supabase project URL');
    console.error('  - VITE_SUPABASE_KEY: Your Supabase anon/public key');
    console.error('');
    console.error('For local development, create a .env file in the project root:');
    console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.error('  VITE_SUPABASE_KEY=your-anon-key');
    console.error('');
    console.error('For Vercel deployment, add these in Project Settings → Environment Variables');
    process.exit(1);
  }
  
  return value;
}

/**
 * Replace placeholders in a file
 */
function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Warning: File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [placeholder, value] of Object.entries(replacements)) {
    if (content.includes(placeholder)) {
      content = content.replace(new RegExp(placeholder, 'g'), value);
      modified = true;
      console.log(`  ✓ Replaced ${placeholder} in ${path.basename(filePath)}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

/**
 * Recursively find and replace in all JS files
 */
function replaceInDirectory(dir, replacements) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Warning: Directory not found: ${dir}`);
    return 0;
  }

  let count = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += replaceInDirectory(filePath, replacements);
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      if (replaceInFile(filePath, replacements)) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Replacing environment variables in build files...\n');

  // Load .env file for local development
  loadEnvFile();

  // Get environment variables
  const supabaseUrl = getEnvVar(ENV_VARS.SUPABASE_URL);
  const supabaseKey = getEnvVar(ENV_VARS.SUPABASE_KEY);

  // Prepare replacements
  const replacements = {
    [PLACEHOLDERS.SUPABASE_URL]: supabaseUrl,
    [PLACEHOLDERS.SUPABASE_KEY]: supabaseKey,
  };

  // Find build directory
  const buildDirs = [
    path.join(process.cwd(), 'dist', 'prestamista-dashboard-ui', 'browser'),
    path.join(process.cwd(), 'dist', 'browser'),
    path.join(process.cwd(), 'dist'),
  ];

  let buildDir = null;
  for (const dir of buildDirs) {
    if (fs.existsSync(dir)) {
      buildDir = dir;
      break;
    }
  }

  if (!buildDir) {
    console.error('❌ Error: Build directory not found.');
    console.error('Expected one of:');
    buildDirs.forEach(dir => console.error(`  - ${dir}`));
    process.exit(1);
  }

  console.log(`📂 Build directory: ${buildDir}\n`);

  // Replace in all JS files
  const count = replaceInDirectory(buildDir, replacements);

  if (count > 0) {
    console.log(`\n✅ Successfully replaced environment variables in ${count} file(s).`);
  } else {
    console.log('\n⚠️  No placeholders found. This might indicate:');
    console.log('  1. Environment files are already using direct values (insecure)');
    console.log('  2. Build process has changed');
    console.log('  3. Placeholders are using different format');
  }
}

// Run the script
try {
  main();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
