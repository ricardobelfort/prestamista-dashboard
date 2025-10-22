import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase = inject(SupabaseService);

  // Autenticação automática para desenvolvimento
  private async ensureAuthenticated() {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    
    if (!user) {
      const debugUser = localStorage.getItem('debug_user');
      const email = debugUser || 'admin@demo.com';
      
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password: '123456'
      });
      
      if (error) {
        throw new Error('Authentication failed - unable to login with development credentials');
      }
    }
  }

  async listClients() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client.rpc('fn_list_clients');
      if (error) throw new Error(error.message);
      
      const activeClients = (data || []).filter((client: any) => client.status === 'active');
      
      const clientsWithRoutes = await Promise.all(
        activeClients.map(async (client: any) => {
          if (client.route_id) {
            try {
              const { data: route } = await this.supabase.client
                .from('routes')
                .select('id, name, assigned_to')
                .eq('id', client.route_id)
                .single();
              
              return { ...client, routes: route || null };
            } catch {
              return { ...client, routes: null };
            }
          } else {
            return { ...client, routes: null };
          }
        })
      );
      
      return clientsWithRoutes.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
    } catch (err: any) {
      throw err;
    }
  }

  async listLoans() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client.rpc('fn_list_loans');
      if (error) throw new Error(error.message);
      
      return data || [];
    } catch (err: any) {
      throw err;
    }
  }

  async listPayments() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client.rpc('fn_list_payments');
      if (error) throw new Error(error.message);
      
      return data || [];
    } catch (err: any) {
      throw err;
    }
  }

  async listRoutes() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client.rpc('fn_list_routes');
      if (error) return [];
      
      return (data || []).map((route: any) => ({
        id: route.id,
        name: route.name,
        assigned_to: route.assigned_to,
        created_at: route.created_at,
        profiles: route.assigned_user_name ? {
          full_name: route.assigned_user_name
        } : null
      }));
      
    } catch (err: any) {
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
      
      if (error) return { full_name: 'Usuário' };
      return data;
    } catch (err: any) {
      return { full_name: 'Usuário' };
    }
  }

  async getDashboardMetrics() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client.rpc('fn_dashboard_metrics');
      
      if (error) {
        return {
          total_principal: 0,
          total_recebido: 0,
          total_em_aberto: 0
        };
      }
      
      return data && data.length > 0 ? data[0] : {
        total_principal: 0,
        total_recebido: 0,
        total_em_aberto: 0
      };
      
    } catch (err: any) {
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
      
      if (error) return [];
      return data || [];
    } catch (err: any) {
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
      throw err;
    }
  }
}