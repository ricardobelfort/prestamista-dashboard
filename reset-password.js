const { createClient } = require('@supabase/supabase-js');

// Cliente com role service_role (admin)
const supabase = createClient(
  'https://frwawmcvrpdhsuljrvlw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2F3bWN2cnBkaHN1bGpydmx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTU1Mjc0MywiZXhwIjoyMDQ1MTI4NzQzfQ.jnZLBYfMYmH9rvYL6CqbH-PTQvEbPr9u-VbJt6hOCPI'
);

async function resetPassword() {
  try {
    console.log('Resetando senha do usuário admin@demo.com...');
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      '90b5d1aa-6e89-4286-8ad6-94232395e5ce',
      { password: 'admin123' }
    );
    
    if (error) {
      console.error('❌ Erro ao resetar senha:', error.message);
    } else {
      console.log('✅ Senha resetada para "admin123"');
      console.log('User ID:', data.user.id);
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

resetPassword();