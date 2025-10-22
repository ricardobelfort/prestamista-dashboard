import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase = inject(SupabaseService);

  async listClients() {
    try {
      const { data, error } = await this.supabase.client
        .from('clients')
        .select('id, name, phone, address, route_id')
        .order('name', { ascending: true });
      
      if (error) {
        console.warn('Supabase error, using mock data:', error);
        return this.getMockClients();
      }
      return data;
    } catch (err) {
      console.warn('Database not configured, using mock data:', err);
      return this.getMockClients();
    }
  }

  async listLoans() {
    try {
      const { data, error } = await this.supabase.client
        .from('loans')
        .select('id, client_id, principal, interest_rate, start_date, installments_count, notes')
        .order('start_date', { ascending: false });
      
      if (error) {
        console.warn('Supabase error, using mock data:', error);
        return this.getMockLoans();
      }
      return data;
    } catch (err) {
      console.warn('Database not configured, using mock data:', err);
      return this.getMockLoans();
    }
  }

  async listPayments() {
    try {
      const { data, error } = await this.supabase.client
        .from('payments')
        .select('id, value, method, paid_on, notes, installment_id')
        .order('paid_on', { ascending: false });
      
      if (error) {
        console.warn('Supabase error, using mock data:', error);
        return this.getMockPayments();
      }
      return data;
    } catch (err) {
      console.warn('Database not configured, using mock data:', err);
      return this.getMockPayments();
    }
  }

  async listRoutes() {
    try {
      const { data, error } = await this.supabase.client
        .from('routes')
        .select('id, name, assigned_to')
        .order('name', { ascending: true });
      
      if (error) {
        console.warn('Supabase error, using mock data:', error);
        return this.getMockRoutes();
      }
      return data;
    } catch (err) {
      console.warn('Database not configured, using mock data:', err);
      return this.getMockRoutes();
    }
  }

  async getProfile() {
    try {
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('full_name')
        .single();
      
      if (error) {
        console.warn('Supabase error, using mock data:', error);
        return { full_name: 'Usuário Demo' };
      }
      return data;
    } catch (err) {
      console.warn('Database not configured, using mock data:', err);
      return { full_name: 'Usuário Demo' };
    }
  }

  // Mock data methods
  private getMockClients() {
    return [
      {
        id: 1,
        name: 'João Silva',
        phone: '(11) 99999-1111',
        address: 'Rua das Flores, 123 - Centro',
        route_id: 1
      },
      {
        id: 2,
        name: 'Maria Santos',
        phone: '(11) 99999-2222',
        address: 'Av. Principal, 456 - Jardim',
        route_id: 1
      },
      {
        id: 3,
        name: 'Pedro Costa',
        phone: '(11) 99999-3333',
        address: 'Rua da Paz, 789 - Vila Nova',
        route_id: 2
      }
    ];
  }

  private getMockLoans() {
    return [
      {
        id: 1,
        client_id: 1,
        principal: 5000,
        interest_rate: 3,
        start_date: '2024-01-15',
        installments_count: 12,
        notes: 'Empréstimo para capital de giro'
      },
      {
        id: 2,
        client_id: 2,
        principal: 3000,
        interest_rate: 2.5,
        start_date: '2024-02-01',
        installments_count: 6,
        notes: 'Empréstimo pessoal'
      },
      {
        id: 3,
        client_id: 3,
        principal: 8000,
        interest_rate: 4,
        start_date: '2024-01-30',
        installments_count: 18,
        notes: 'Financiamento de veículo'
      }
    ];
  }

  private getMockPayments() {
    return [
      {
        id: 1,
        value: 450,
        method: 'pix',
        paid_on: '2024-02-15',
        notes: 'Pagamento em dia',
        installment_id: 1
      },
      {
        id: 2,
        value: 520,
        method: 'cash',
        paid_on: '2024-02-10',
        notes: 'Pagamento antecipado',
        installment_id: 2
      },
      {
        id: 3,
        value: 480,
        method: 'card',
        paid_on: '2024-02-08',
        notes: 'Pagamento via cartão',
        installment_id: 3
      }
    ];
  }

  private getMockRoutes() {
    return [
      {
        id: 1,
        name: 'Rota Centro',
        assigned_to: 'Carlos Oliveira'
      },
      {
        id: 2,
        name: 'Rota Norte',
        assigned_to: 'Ana Paula'
      },
      {
        id: 3,
        name: 'Rota Sul',
        assigned_to: null
      }
    ];
  }
}