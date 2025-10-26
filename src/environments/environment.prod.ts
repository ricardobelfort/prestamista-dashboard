export const environment = {
  production: true,
  // SECURITY: These placeholders are replaced at build time with actual environment variables
  // This ensures credentials are NEVER committed to the repository
  // Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in Vercel's Environment Variables
  supabaseUrl: '__SUPABASE_URL__',
  supabaseKey: '__SUPABASE_KEY__',
  features: {
    enableAutoLogin: false, // SECURITY: Auto-login NUNCA deve ser habilitado em produção
  }
};