import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase = inject(SupabaseService);

  // Autenticação automática para desenvolvimento
  private async ensureAuthenticated() {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    
    if (!user) {
      // Para desenvolvimento, fazer login automático com usuário admin existente
      // IMPORTANTE: Remover isso em produção e implementar login real
      console.log('🔐 Tentando autenticação automática...');
      
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email: 'admin@demo.com',
        password: '123456'
      });
      
      if (error) {
        console.error('❌ Auto-login failed:', error.message);
        throw new Error('Authentication failed - unable to login with development credentials');
      } else {
        console.log('✅ Auto-authenticated as admin@demo.com');
      }
    } else {
      console.log('✅ User already authenticated:', user.email);
    }
  }

  async listClients() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('clients')
        .select(`
          id,
          name,
          phone,
          address,
          doc_id,
          status,
          route_id,
          routes(
            id,
            name,
            assigned_to
          )
        `)
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (err: any) {
      console.error('Error loading clients:', err);
      throw err;
    }
  }

  async listLoans() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('loans')
        .select(`
          id,
          client_id,
          principal,
          interest_rate,
          interest,
          installments_count,
          start_date,
          status,
          notes,
          clients(
            id,
            name,
            phone
          )
        `)
        .in('status', ['active', 'pending'])
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (err: any) {
      console.error('Error loading loans:', err);
      throw err;
    }
  }

  async listPayments() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('payments')
        .select(`
          id,
          installment_id,
          value,
          method,
          paid_on,
          notes,
          installments(
            id,
            index_no,
            due_date,
            amount,
            loans(
              id,
              principal,
              clients(
                id,
                name
              )
            )
          )
        `)
        .order('paid_on', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (err: any) {
      console.error('Error loading payments:', err);
      throw err;
    }
  }

  async listRoutes() {
    try {
      await this.ensureAuthenticated();
      
      console.log('🔍 DataService: Iniciando listRoutes()');
      
      // Buscar rotas com perfis dos usuários atribuídos
      const { data, error } = await this.supabase.client
        .from('routes')
        .select(`
          id,
          name,
          assigned_to,
          created_at,
          profiles!routes_assigned_to_profiles_fkey(
            full_name
          )
        `)
        .order('name', { ascending: true });
      
      console.log('📊 Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        // Fallback sem join se houver erro
        const { data: simpleData } = await this.supabase.client
          .from('routes')
          .select('id, name, assigned_to, created_at')
          .order('name', { ascending: true });
          
        return (simpleData || []).map(route => ({
          ...route,
          profiles: route.assigned_to ? { full_name: 'Usuário' } : null
        }));
      }

      console.log('✅ Dados reais recebidos:', data?.length || 0, 'rotas');
      
      return data || [];
      
    } catch (err: any) {
      console.error('💥 Erro geral em listRoutes:', err);
      return [];
    }
  }

  async getProfile() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('full_name, default_org')
        .eq('user_id', (await this.supabase.client.auth.getUser()).data.user?.id)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        return { full_name: 'Usuário' };
      }
      
      return data;
    } catch (err: any) {
      console.error('Error loading profile:', err);
      return { full_name: 'Usuário' };
    }
  }

  async getDashboardMetrics() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('v_dashboard')
        .select('*')
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        // Return default metrics if view doesn't exist or no data
        return {
          total_principal: 0,
          total_recebido: 0,
          total_em_aberto: 0
        };
      }
      
      return data;
    } catch (err: any) {
      console.error('Error loading dashboard metrics:', err);
      return {
        total_principal: 0,
        total_recebido: 0,
        total_em_aberto: 0
      };
    }
  }

  async getInstallmentsDue() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('installments')
        .select(`
          id,
          index_no,
          due_date,
          amount,
          paid_amount,
          paid_at,
          loans(
            id,
            principal,
            clients(
              id,
              name,
              phone
            )
          )
        `)
        .is('paid_at', null)
        .lte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(10);
      
      if (error) {
        console.error('Supabase error:', error);
        return [];
      }
      
      return data || [];
    } catch (err: any) {
      console.error('Error loading overdue installments:', err);
      return [];
    }
  }

  // CRUD Operations
  async createClient(client: any) {
    try {
      await this.ensureAuthenticated();
      
      // Obter organização do usuário atual se não fornecida
      if (!client.org_id) {
        const { data: profile } = await this.supabase.client
          .from('profiles')
          .select('default_org')
          .eq('user_id', (await this.supabase.client.auth.getUser()).data.user?.id)
          .single();
        
        client.org_id = profile?.default_org;
      }
      
      const { data, error } = await this.supabase.client
        .from('clients')
        .insert([{
          name: client.name,
          phone: client.phone,
          address: client.address,
          doc_id: client.doc_id,
          route_id: client.route_id,
          org_id: client.org_id
        }])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      console.error('Error creating client:', err);
      throw err;
    }
  }

  async createLoan(loan: any) {
    try {
      await this.ensureAuthenticated();
      
      // Obter organização do usuário atual se não fornecida
      if (!loan.org_id) {
        const { data: profile } = await this.supabase.client
          .from('profiles')
          .select('default_org')
          .eq('user_id', (await this.supabase.client.auth.getUser()).data.user?.id)
          .single();
        
        loan.org_id = profile?.default_org;
      }
      
      const { data, error } = await this.supabase.client
        .from('loans')
        .insert([{
          client_id: loan.client_id,
          principal: loan.principal,
          interest_rate: loan.interest_rate,
          interest: loan.interest || 'simple',
          installments_count: loan.installments_count,
          start_date: loan.start_date,
          notes: loan.notes,
          org_id: loan.org_id
        }])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      console.error('Error creating loan:', err);
      throw err;
    }
  }

  async createPayment(payment: any) {
    try {
      await this.ensureAuthenticated();
      
      // Obter organização do usuário atual se não fornecida
      if (!payment.org_id) {
        const { data: profile } = await this.supabase.client
          .from('profiles')
          .select('default_org')
          .eq('user_id', (await this.supabase.client.auth.getUser()).data.user?.id)
          .single();
        
        payment.org_id = profile?.default_org;
      }
      
      // Preparar dados para inserção, removendo installment_id se estiver vazio
      const insertData: any = {
        value: payment.value,
        method: payment.method,
        paid_on: payment.paid_on,
        notes: payment.notes,
        org_id: payment.org_id
      };

      // Só incluir installment_id se ele estiver presente e não vazio
      if (payment.installment_id) {
        insertData.installment_id = payment.installment_id;
      }

      const { data, error } = await this.supabase.client
        .from('payments')
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      console.error('Error creating payment:', err);
      throw err;
    }
  }

  async createRoute(route: any) {
    try {
      await this.ensureAuthenticated();
      
      // Obter organização do usuário atual se não fornecida
      if (!route.org_id) {
        const { data: profile } = await this.supabase.client
          .from('profiles')
          .select('default_org')
          .eq('user_id', (await this.supabase.client.auth.getUser()).data.user?.id)
          .single();
        
        route.org_id = profile?.default_org;
      }
      
      const { data, error } = await this.supabase.client
        .from('routes')
        .insert([{
          name: route.name,
          assigned_to: route.assigned_to,
          org_id: route.org_id
        }])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      console.error('Error creating route:', err);
      throw err;
    }
  }

  // Route CRUD methods
  async updateRoute(id: string, updates: any) {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      console.error('Error updating route:', err);
      throw err;
    }
  }

  async deleteRoute(id: string) {
    try {
      await this.ensureAuthenticated();
      
      const { error } = await this.supabase.client
        .from('routes')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    } catch (err: any) {
      console.error('Error deleting route:', err);
      throw err;
    }
  }

  // Client CRUD methods
  async updateClient(id: string, updates: any) {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      console.error('Error updating client:', err);
      throw err;
    }
  }

  async deleteClient(id: string) {
    try {
      await this.ensureAuthenticated();
      
      const { error } = await this.supabase.client
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    } catch (err: any) {
      console.error('Error deleting client:', err);
      throw err;
    }
  }

  // Loan CRUD methods
  async updateLoan(id: string, updates: any) {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('loans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      console.error('Error updating loan:', err);
      throw err;
    }
  }

  async deleteLoan(id: string) {
    try {
      await this.ensureAuthenticated();
      
      const { error } = await this.supabase.client
        .from('loans')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    } catch (err: any) {
      console.error('Error deleting loan:', err);
      throw err;
    }
  }

  // Payment CRUD methods
  async updatePayment(id: string, updates: any) {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      console.error('Error updating payment:', err);
      throw err;
    }
  }

  async deletePayment(id: string) {
    try {
      await this.ensureAuthenticated();
      
      const { error } = await this.supabase.client
        .from('payments')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    } catch (err: any) {
      console.error('Error deleting payment:', err);
      throw err;
    }
  }
}