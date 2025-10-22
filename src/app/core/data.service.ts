import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase = inject(SupabaseService);

  // Autenticação automática para desenvolvimento
  private async ensureAuthenticated() {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    
    if (!user) {
      // Para desenvolvimento, fazer login automático
      // IMPORTANTE: Remover isso em produção e implementar login real
      const { error } = await this.supabase.client.auth.signInWithPassword({
        email: 'dev@prestamista.com',
        password: 'dev123456'
      });
      
      if (error) {
        console.warn('Auto-login failed:', error.message);
        // Se falhar, continuar sem autenticação (RLS está desabilitado temporariamente)
      }
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
      console.log('🔍 DataService: Iniciando listRoutes()');
      
      // Versão simplificada apenas para debugging
      const { data, error } = await this.supabase.client
        .from('routes')
        .select('id, name, assigned_to, created_at')
        .order('name', { ascending: true });
      
      console.log('📊 Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        console.log('🔄 Usando dados mock como fallback');
        return [
          {
            id: '1',
            name: 'Rota Centro (Mock)',
            assigned_to: null,
            created_at: new Date().toISOString(),
            profiles: { full_name: 'Cobrador Demo' }
          }
        ];
      }

      console.log('✅ Dados reais recebidos:', data?.length || 0, 'rotas');
      
      // Retornar dados simples primeiro, sem buscar perfis
      return (data || []).map(route => ({
        ...route,
        profiles: { full_name: 'Carregando...' }
      }));
      
    } catch (err: any) {
      console.error('💥 Erro geral em listRoutes:', err);
      return [
        {
          id: '1',
          name: 'Rota Erro (Mock)',
          assigned_to: null,
          created_at: new Date().toISOString(),
          profiles: { full_name: 'Erro de conexão' }
        }
      ];
    }
  }

  async getProfile() {
    try {
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