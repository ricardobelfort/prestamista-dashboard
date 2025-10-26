// DEVELOPMENT: Uses placeholders replaced at runtime by replace-env-dev.js
// For local development, start with: npm run dev
// This reads from .env file and replaces placeholders before serving

export const environment = {
  production: false,
  supabaseUrl: '__SUPABASE_URL__',
  supabaseKey: '__SUPABASE_KEY__',
  features: {
    enableAutoLogin: false,
  }
};