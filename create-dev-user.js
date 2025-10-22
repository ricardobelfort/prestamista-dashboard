const { createClient } = require('@supabase/supabase-js');

// Cliente anon (público)
const supabase = createClient(
  'https://frwawmcvrpdhsuljrvlw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2F3bWN2cnBkaHN1bGpydmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1NTI3NDMsImV4cCI6MjA0NTEyODc0M30.KNiOcPwWEHPdP7WfbTH8vQYkqnDgdmRx4Fxgj1vhtno'
);

async function createDevUser() {
  try {
    console.log('Criando usuário de desenvolvimento...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'dev@prestamista.com',
      password: 'dev123456'
    });
    
    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
    } else {
      console.log('✅ Usuário criado:', data.user?.email);
      console.log('User ID:', data.user?.id);
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

createDevUser();