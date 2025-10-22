// Script para testar e inserir dados de desenvolvimento
// Execute no console do browser para testar as funções RPC

// 1. Verificar se o usuário está autenticado
async function checkAuth() {
  const { data } = await window._supabase.auth.getUser();
  console.log('User:', data.user);
  return data.user;
}

// 2. Testar função RPC de clientes
async function testRPCClients() {
  const { data, error } = await window._supabase.rpc('fn_list_clients');
  console.log('RPC fn_list_clients:', { data, error });
  return data;
}

// 3. Testar função RPC de empréstimos
async function testRPCLoans() {
  const { data, error } = await window._supabase.rpc('fn_list_loans');
  console.log('RPC fn_list_loans:', { data, error });
  return data;
}

// 4. Testar função RPC de pagamentos
async function testRPCPayments() {
  const { data, error } = await window._supabase.rpc('fn_list_payments');
  console.log('RPC fn_list_payments:', { data, error });
  return data;
}

// 5. Testar função RPC de rotas
async function testRPCRoutes() {
  const { data, error } = await window._supabase.rpc('fn_list_routes');
  console.log('RPC fn_list_routes:', { data, error });
  return data;
}

// 6. Testar métricas do dashboard
async function testRPCMetrics() {
  const { data, error } = await window._supabase.rpc('fn_dashboard_metrics');
  console.log('RPC fn_dashboard_metrics:', { data, error });
  return data;
}

// 7. Verificar tabelas diretamente (para debug)
async function checkTables() {
  try {
    const clients = await window._supabase.from('clients').select('count');
    console.log('Clientes direto:', clients);
    
    const loans = await window._supabase.from('loans').select('count');
    console.log('Empréstimos direto:', loans);
    
    const payments = await window._supabase.from('payments').select('count');
    console.log('Pagamentos direto:', payments);
  } catch (error) {
    console.error('Erro ao acessar tabelas diretamente:', error);
  }
}

// 8. Verificar organização do usuário
async function checkUserOrg() {
  const { data: user } = await window._supabase.auth.getUser();
  if (user?.user) {
    const { data } = await window._supabase
      .from('profiles')
      .select('default_org')
      .eq('user_id', user.user.id)
      .single();
    console.log('Organização do usuário:', data);
    return data?.default_org;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🔍 Iniciando testes de debug...');
  
  const user = await checkAuth();
  if (!user) {
    console.error('❌ Usuário não autenticado!');
    return;
  }
  
  const org = await checkUserOrg();
  console.log('🏢 Organização:', org);
  
  await testRPCClients();
  await testRPCLoans();
  await testRPCPayments();
  await testRPCRoutes();
  await testRPCMetrics();
  
  await checkTables();
  
  console.log('✅ Testes concluídos!');
}

// Exposer funções globalmente para facilitar o debug
window.debugRPC = {
  checkAuth,
  testRPCClients,
  testRPCLoans,
  testRPCPayments,
  testRPCRoutes,
  testRPCMetrics,
  checkTables,
  checkUserOrg,
  runAllTests
};

console.log('🛠️ Funções de debug disponíveis em window.debugRPC');
console.log('Execute window.debugRPC.runAllTests() para testar tudo');