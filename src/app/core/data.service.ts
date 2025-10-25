import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Logger } from './logger.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase = inject(SupabaseService);
  private toastService = inject(ToastService);

  // Cache para getUserRole
  private userRoleCache: string | null = null;
  private userRoleCacheTimestamp = 0;
  private readonly ROLE_CACHE_DURATION = 60000; // 60 segundos

  // SECURITY: Verificação de autenticação
  // Auto-login removido por questões de segurança
  // Para desenvolvimento local com auto-login, use environment.local.ts
  private async ensureAuthenticated() {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    
    if (!user) {
      // SECURITY: Não fazer auto-login em produção ou por padrão
      // Se precisar de auto-login para desenvolvimento, configure environment.local.ts
      throw new Error('User not authenticated. Please login first.');
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

  async listInstallments(loanId?: number) {
    try {
      await this.ensureAuthenticated();
      
      let query = this.supabase.client
        .from('installments')
        .select(`
          *,
          loans!inner(
            id,
            client_id,
            principal,
            clients!inner(
              id,
              name
            )
          )
        `)
        .order('due_date', { ascending: true });
      
      // Se fornecido um loan_id, filtrar por ele
      if (loanId) {
        query = query.eq('loan_id', loanId);
      }
      
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      
      return data || [];
    } catch (err: any) {
      throw err;
    }
  }

  // =============================================
  // MÉTODOS DO DASHBOARD
  // =============================================

  async getDashboardMetrics() {
    try {
      await this.ensureAuthenticated();
      
      const user = (await this.supabase.client.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('default_org')
        .eq('user_id', user.id)
        .single();
      
      const orgId = profile?.default_org;
      if (!orgId) throw new Error('Organization not found');
      
      const { data, error } = await this.supabase.client
        .rpc('fn_get_dashboard_metrics', { p_org_id: orgId });
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      Logger.error('Error getting dashboard metrics', err);
      throw err;
    }
  }

  async getMonthlyEvolution(months: number = 6) {
    try {
      await this.ensureAuthenticated();
      
      const user = (await this.supabase.client.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('default_org')
        .eq('user_id', user.id)
        .single();
      
      const orgId = profile?.default_org;
      if (!orgId) throw new Error('Organization not found');
      
      const { data, error } = await this.supabase.client
        .rpc('fn_get_monthly_evolution', { 
          p_org_id: orgId,
          p_months: months 
        });
      
      if (error) throw new Error(error.message);
      return data || [];
    } catch (err: any) {
      Logger.error('Error getting monthly evolution', err);
      throw err;
    }
  }

  async getUpcomingInstallments(days: number = 7) {
    try {
      await this.ensureAuthenticated();
      
      const user = (await this.supabase.client.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('default_org')
        .eq('user_id', user.id)
        .single();
      
      const orgId = profile?.default_org;
      if (!orgId) throw new Error('Organization not found');
      
      const { data, error } = await this.supabase.client
        .rpc('fn_get_upcoming_installments', { 
          p_org_id: orgId,
          p_days: days 
        });
      
      if (error) throw new Error(error.message);
      return data || [];
    } catch (err: any) {
      Logger.error('Error getting upcoming installments', err);
      throw err;
    }
  }

  async getClientFinancialHistory(clientId: string) {
    try {
      await this.ensureAuthenticated();
      
      const user = (await this.supabase.client.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('default_org')
        .eq('user_id', user.id)
        .single();
      
      const orgId = profile?.default_org;
      if (!orgId) throw new Error('Organization not found');
      
      const { data, error } = await this.supabase.client
        .rpc('fn_get_client_financial_history', { 
          p_org_id: orgId,
          p_client_id: clientId 
        });
      
      if (error) throw new Error(error.message);
      return data || { summary: {}, loans: [] };
    } catch (err: any) {
      Logger.error('Error getting client financial history', err);
      throw err;
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

  async getCurrentUserRole() {
    try {
      // Verificar se o cache é válido
      const now = Date.now();
      if (this.userRoleCache && (now - this.userRoleCacheTimestamp) < this.ROLE_CACHE_DURATION) {
        return this.userRoleCache;
      }

      await this.ensureAuthenticated();
      
      const { data: user } = await this.supabase.client.auth.getUser();
      
      if (!user.user) throw new Error('Usuário não autenticado');
      
      // Usar função RPC para obter o role (bypassa RLS)
      const { data, error } = await this.supabase.client.rpc('fn_get_user_role');
      
      if (error) {
        this.userRoleCache = 'viewer';
        this.userRoleCacheTimestamp = now;
        return 'viewer';
      }
      
      const role = data || 'viewer';
      
      // Atualizar cache
      this.userRoleCache = role;
      this.userRoleCacheTimestamp = now;
      
      return role;
    } catch (err: any) {
      // Log interno para debug, sem mostrar toast para o usuário
      Logger.error('Erro ao verificar role do usuário:', err);
      return 'viewer';
    }
  }

  // Método público para limpar o cache do role (útil após mudanças de permissão)
  clearRoleCache() {
    this.userRoleCache = null;
    this.userRoleCacheTimestamp = 0;
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
      
      const user = (await this.supabase.client.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      // Obter org_id do perfil do usuário
      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('default_org')
        .eq('user_id', user.id)
        .single();
      
      const orgId = profile?.default_org;
      if (!orgId) throw new Error('Organization not found');
      
      // Chamar função RPC que cria o empréstimo E gera as parcelas automaticamente
      const { data, error } = await this.supabase.client
        .rpc('create_loan_with_installments', {
          p_org_id: orgId,
          p_client_id: loan.client_id,
          p_principal: loan.principal,
          p_interest_rate: loan.interest_rate || 0,
          p_start_date: loan.start_date,
          p_installments_count: loan.installments_count,
          p_notes: loan.notes || ''
        });
      
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      throw err;
    }
  }

  async createPayment(payment: any) {
    try {
      await this.ensureAuthenticated();
      
      const user = (await this.supabase.client.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      // Obter org_id do perfil do usuário
      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('default_org')
        .eq('user_id', user.id)
        .single();
      
      const orgId = profile?.default_org;
      if (!orgId) throw new Error('Organization not found');
      
      // Inserir pagamento - o trigger vai atualizar a parcela automaticamente
      const { data, error } = await this.supabase.client
        .from('payments')
        .insert([{
          org_id: orgId,
          installment_id: payment.installment_id || null,
          value: payment.value,
          method: payment.method,
          paid_on: payment.paid_on,
          notes: payment.notes
        }])
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

  // Métodos para exportação
  async getClients() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('clients')
        .select(`
          *,
          routes (id, name)
        `)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw new Error(error.message);
      return data || [];
    } catch (err: any) {
      throw err;
    }
  }

  async getLoans() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('loans')
        .select(`
          *,
          clients (id, name),
          installments (
            id,
            index_no,
            due_date,
            amount,
            paid_amount,
            late_fee
          )
        `)
        .order('start_date', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    } catch (err: any) {
      throw err;
    }
  }

  async getPayments() {
    try {
      await this.ensureAuthenticated();
      
      const { data, error } = await this.supabase.client
        .from('payments')
        .select(`
          *,
          installments (
            id,
            index_no,
            loans (
              id,
              clients (id, name)
            )
          )
        `)
        .order('paid_on', { ascending: false});
      
      if (error) throw new Error(error.message);
      return data || [];
    } catch (err: any) {
      throw err;
    }
  }
}
