export const environment = {
  production: false,
  // SECURITY: These placeholders are replaced at build time with actual environment variables
  // Never commit real credentials to the repository
  supabaseUrl: '__SUPABASE_URL__',
  supabaseKey: '__SUPABASE_KEY__',
  features: {
    enableAutoLogin: false, // SECURITY: Auto-login desabilitado por padrão
  }
};