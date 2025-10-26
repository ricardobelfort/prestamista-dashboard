export const environment = {
  production: false,
  // DEVELOPMENT: Using real credentials for local development
  // These are replaced at build time with placeholders for production builds
  supabaseUrl: 'https://frwawmcvrpdhsuljrvlw.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2F3bWN2cnBkaHN1bGpydmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODI1ODQsImV4cCI6MjA3NjY1ODU4NH0.95Om2RvBjsHASPF-wLhjN32ntbMRKK9TwypLgVS23p4',
  features: {
    enableAutoLogin: false, // SECURITY: Auto-login desabilitado por padrão
  }
};