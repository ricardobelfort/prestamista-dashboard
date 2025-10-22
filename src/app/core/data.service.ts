import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase = inject(SupabaseService);

  async listClients() {
    const { data, error } = await this.supabase.client
      .from('clients')
      .select('id, name, phone, address, route_id')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  }

  async listLoans() {
    const { data, error } = await this.supabase.client
      .from('loans')
      .select('id, client_id, principal, interest_rate, start_date, installments_count, notes')
      .order('start_date', { ascending: false });
    if (error) throw error;
    return data;
  }

  async listPayments() {
    const { data, error } = await this.supabase.client
      .from('payments')
      .select('id, value, method, paid_on, notes, installment_id')
      .order('paid_on', { ascending: false });
    if (error) throw error;
    return data;
  }

  async listRoutes() {
    const { data, error } = await this.supabase.client
      .from('routes')
      .select('id, name, assigned_to')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  }

  async getProfile() {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('full_name')
      .single();
    if (error) throw error;
    return data;
  }
}