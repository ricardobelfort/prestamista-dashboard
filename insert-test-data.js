// Script para inserir dados de teste
// Execute no console do browser após carregar a aplicação

async function insertTestData() {
  console.log('🚀 Inserindo dados de teste...');
  
  try {
    // Verificar se o usuário está autenticado
    const { data: { user } } = await window._supabase.auth.getUser();
    if (!user) {
      console.error('❌ Usuário não autenticado!');
      return;
    }

    // 1. Verificar/criar organização padrão
    const { data: profile } = await window._supabase
      .from('profiles')
      .select('default_org')
      .eq('user_id', user.id)
      .single();

    let orgId = profile?.default_org;
    
    if (!orgId) {
      // Criar organização padrão
      const { data: newOrg } = await window._supabase
        .from('organizations')
        .insert([{
          name: 'Demo Organization',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      orgId = newOrg.id;
      
      // Atualizar perfil com organização padrão
      await window._supabase
        .from('profiles')
        .update({ default_org: orgId })
        .eq('user_id', user.id);
      
      console.log('✅ Organização criada:', orgId);
    }

    // 2. Inserir rotas de teste
    const { data: existingRoutes } = await window._supabase.rpc('fn_list_routes');
    
    if (!existingRoutes || existingRoutes.length === 0) {
      const routes = [
        { name: 'Rota Centro', assigned_to: user.id, organization_id: orgId },
        { name: 'Rota Norte', assigned_to: user.id, organization_id: orgId },
        { name: 'Rota Sul', assigned_to: user.id, organization_id: orgId }
      ];

      const { data: insertedRoutes } = await window._supabase
        .from('routes')
        .insert(routes)
        .select();
      
      console.log('✅ Rotas criadas:', insertedRoutes?.length);
    }

    // 3. Inserir clientes de teste
    const { data: existingClients } = await window._supabase.rpc('fn_list_clients');
    
    if (!existingClients || existingClients.length === 0) {
      const clients = [
        {
          name: 'João Silva',
          document: '123.456.789-01',
          phone: '(11) 99999-0001',
          email: 'joao@email.com',
          address: 'Rua A, 123',
          organization_id: orgId
        },
        {
          name: 'Maria Santos',
          document: '234.567.890-12',
          phone: '(11) 99999-0002',
          email: 'maria@email.com',
          address: 'Rua B, 456',
          organization_id: orgId
        },
        {
          name: 'Pedro Costa',
          document: '345.678.901-23',
          phone: '(11) 99999-0003',
          email: 'pedro@email.com',
          address: 'Rua C, 789',
          organization_id: orgId
        }
      ];

      const { data: insertedClients } = await window._supabase
        .from('clients')
        .insert(clients)
        .select();
      
      console.log('✅ Clientes criados:', insertedClients?.length);

      // 4. Inserir empréstimos de teste
      if (insertedClients && insertedClients.length > 0) {
        const loans = [
          {
            client_id: insertedClients[0].id,
            principal: 1000.00,
            interest_rate: 2.5,
            installments_count: 12,
            start_date: '2024-01-15',
            status: 'active',
            notes: 'Empréstimo para capital de giro',
            organization_id: orgId
          },
          {
            client_id: insertedClients[1].id,
            principal: 2500.00,
            interest_rate: 3.0,
            installments_count: 24,
            start_date: '2024-02-01',
            status: 'active',
            notes: 'Empréstimo para reformas',
            organization_id: orgId
          },
          {
            client_id: insertedClients[2].id,
            principal: 500.00,
            interest_rate: 2.0,
            installments_count: 6,
            start_date: '2024-03-10',
            status: 'completed',
            notes: 'Empréstimo emergencial',
            organization_id: orgId
          }
        ];

        const { data: insertedLoans } = await window._supabase
          .from('loans')
          .insert(loans)
          .select();
        
        console.log('✅ Empréstimos criados:', insertedLoans?.length);

        // 5. Inserir pagamentos de teste
        if (insertedLoans && insertedLoans.length > 0) {
          const payments = [
            {
              loan_id: insertedLoans[0].id,
              amount: 95.83,
              payment_date: '2024-01-15',
              installment_number: 1,
              status: 'completed',
              organization_id: orgId
            },
            {
              loan_id: insertedLoans[0].id,
              amount: 95.83,
              payment_date: '2024-02-15',
              installment_number: 2,
              status: 'completed',
              organization_id: orgId
            },
            {
              loan_id: insertedLoans[1].id,
              amount: 125.00,
              payment_date: '2024-02-01',
              installment_number: 1,
              status: 'completed',
              organization_id: orgId
            },
            {
              loan_id: insertedLoans[1].id,
              amount: 125.00,
              payment_date: null,
              installment_number: 2,
              status: 'pending',
              organization_id: orgId
            }
          ];

          const { data: insertedPayments } = await window._supabase
            .from('payments')
            .insert(payments)
            .select();
          
          console.log('✅ Pagamentos criados:', insertedPayments?.length);
        }
      }
    }

    console.log('🎉 Dados de teste inseridos com sucesso!');
    console.log('🔄 Recarregue a página para ver os dados no dashboard');
    
    return true;

  } catch (error) {
    console.error('❌ Erro ao inserir dados de teste:', error);
    return false;
  }
}

// Expor função globalmente
window.insertTestData = insertTestData;

console.log('📝 Execute window.insertTestData() para inserir dados de teste');