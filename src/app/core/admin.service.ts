import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface OrganizationMember {
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'collector' | 'viewer';
  user_email?: string;
  user_name?: string;
}

export interface CreateOrganizationData {
  name: string;
  owner_email: string;
  owner_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private supabase = inject(SupabaseService);
  private toastService = inject(ToastService);

  // =============================================
  // ORGANIZAÇÕES
  // =============================================

  async listOrganizations(): Promise<Organization[]> {
    try {
      // Usar função RPC para obter organizações (bypassa RLS)
      const { data, error } = await this.supabase.client.rpc('fn_list_organizations');
      
      if (error) {
        this.toastService.error(`Erro ao carregar organizações: ${error.message}`);
        throw new Error(error.message);
      }
      return data || [];
    return data || [];
    } catch (err: any) {
      if (!err.message.includes('Erro ao carregar organizações')) {
        this.toastService.error('Erro inesperado ao carregar organizações');
      }
      throw err;
    }
  }

  async createOrganization(orgData: CreateOrganizationData): Promise<Organization> {
    try {
      // 1. Criar a organização
      const { data: org, error: orgError } = await this.supabase.client
        .from('orgs')
        .insert([{ name: orgData.name }])
        .select()
        .single();
      
      if (orgError) {
        this.toastService.error(`Erro ao criar organização: ${orgError.message}`);
        throw new Error(orgError.message);
      }

      // 2. Criar usuário diretamente (simplificado para desenvolvimento)
      const tempPassword = 'temp123456';
      const { data: newUser, error: userError } = await this.supabase.client.auth.admin.createUser({
        email: orgData.owner_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: orgData.owner_name
        }
      });
      
      if (userError) {
        this.toastService.error(`Erro ao criar usuário: ${userError.message}`);
        throw new Error(userError.message);
      }
      const userId = newUser.user.id;

      // 3. Criar perfil do usuário
      await this.supabase.client
        .from('profiles')
        .upsert([{
          user_id: userId,
          full_name: orgData.owner_name,
          default_org: org.id
        }]);

      // 4. Adicionar usuário como owner da organização
      await this.supabase.client
        .from('org_members')
        .insert([{
          org_id: org.id,
          user_id: userId,
          role: 'owner'
        }]);

      this.toastService.success(`Organização "${orgData.name}" criada com sucesso!`);
      return org;
    } catch (err: any) {
      if (!err.message.includes('Erro ao criar')) {
        this.toastService.error('Erro inesperado ao criar organização');
      }
      throw err;
    }
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
    try {
      const { data, error } = await this.supabase.client
        .from('orgs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        this.toastService.error(`Erro ao atualizar organização: ${error.message}`);
        throw new Error(error.message);
      }
      
      this.toastService.success('Organização atualizada com sucesso!');
      return data;
    } catch (err: any) {
      if (!err.message.includes('Erro ao atualizar')) {
        this.toastService.error('Erro inesperado ao atualizar organização');
      }
      throw err;
    }
  }

  async deleteOrganization(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('orgs')
        .delete()
        .eq('id', id);
      
      if (error) {
        this.toastService.error(`Erro ao excluir organização: ${error.message}`);
        throw new Error(error.message);
      }
      
      this.toastService.success('Organização excluída com sucesso!');
      return true;
    } catch (err: any) {
      if (!err.message.includes('Erro ao excluir')) {
        this.toastService.error('Erro inesperado ao excluir organização');
      }
      throw err;
    }
  }

  // =============================================
  // MEMBROS DA ORGANIZAÇÃO
  // =============================================

  async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    try {
      // Usar função RPC para obter membros (bypassa RLS)
      const { data, error } = await this.supabase.client.rpc('fn_list_org_members', {
        org_id_param: orgId
      });
      
      if (error) {
        this.toastService.error(`Erro ao carregar membros: ${error.message}`);
        throw new Error(error.message);
      }
      
      const members = (data || []).map((member: any) => ({
        org_id: member.org_id,
        user_id: member.user_id,
        role: member.role,
        user_name: member.user_name,
        user_email: member.user_email
      }));
      
      return members;
    } catch (err: any) {
      if (!err.message.includes('Erro ao carregar membros')) {
        this.toastService.error('Erro inesperado ao carregar membros');
      }
      return [];
    }
  }

  async updateMemberRole(orgId: string, userId: string, role: string): Promise<boolean> {
    try {
      // Usar função RPC para atualizar role (bypassa RLS)
      const { data, error } = await this.supabase.client.rpc('fn_update_member_role', {
        org_id_param: orgId,
        user_id_param: userId,
        new_role_param: role
      });
      
      if (error) {
        this.toastService.error(`Erro ao atualizar permissões: ${error.message}`);
        throw new Error(error.message);
      }
      
      this.toastService.success('Permissões atualizadas com sucesso!');
      return true;
    } catch (err: any) {
      if (!err.message.includes('Erro ao atualizar')) {
        this.toastService.error('Erro inesperado ao atualizar permissões');
      }
      throw err;
    }
  }

  async removeMember(orgId: string, userId: string): Promise<boolean> {
    try {
      // Usar função RPC para remover membro (bypassa RLS)
      const { data, error } = await this.supabase.client.rpc('fn_remove_member', {
        org_id_param: orgId,
        user_id_param: userId
      });
      
      if (error) {
        this.toastService.error(`Erro ao remover membro: ${error.message}`);
        throw new Error(error.message);
      }
      
      this.toastService.success('Membro removido com sucesso!');
      return true;
    } catch (err: any) {
      if (!err.message.includes('Erro ao remover')) {
        this.toastService.error('Erro inesperado ao remover membro');
      }
      throw err;
    }
  }

  // =============================================
  // CONVITES
  // =============================================

  async inviteUser(orgId: string, email: string, role: string, name?: string): Promise<string> {
    try {
      // Gerar token único para o convite
      const inviteToken = crypto.randomUUID();
      
      // Criar convite temporário (pode usar uma tabela de convites ou localStorage)
      const inviteData = {
        token: inviteToken,
        org_id: orgId,
        email,
        role,
        name,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      };
      
      // Salvar convite (implementar tabela de convites se necessário)
      localStorage.setItem(`invite_${inviteToken}`, JSON.stringify(inviteData));
      
      // Retornar link de convite
      const inviteLink = `${window.location.origin}/register?invite=${inviteToken}`;
      
      this.toastService.success('Convite criado com sucesso!');
      return inviteLink;
    } catch (err: any) {
      this.toastService.error('Erro inesperado ao criar convite');
      throw err;
    }
  }

  async getInviteData(token: string): Promise<any> {
    try {
      const inviteData = localStorage.getItem(`invite_${token}`);
      if (!inviteData) throw new Error('Convite não encontrado');
      
      const invite = JSON.parse(inviteData);
      
      // Verificar se convite não expirou
      if (new Date() > new Date(invite.expires_at)) {
        localStorage.removeItem(`invite_${token}`);
        throw new Error('Convite expirado');
      }
      
      return invite;
    } catch (err: any) {
      throw err;
    }
  }

  // =============================================
  // ESTATÍSTICAS ADMINISTRATIVAS
  // =============================================

  async getAdminStats(): Promise<any> {
    try {
      // Usar função RPC para obter estatísticas (bypassa RLS)
      const { data, error } = await this.supabase.client.rpc('fn_admin_stats');

      if (error) {
        this.toastService.error(`Erro ao carregar estatísticas: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data && data.length > 0 ? data[0] : {
        total_organizations: 0,
        total_users: 0,
        total_loans: 0
      };
    } catch (err: any) {
      if (!err.message.includes('Erro ao carregar estatísticas')) {
        this.toastService.error('Erro inesperado ao carregar estatísticas');
      }
      return {
        total_organizations: 0,
        total_users: 0,
        total_loans: 0
      };
    }
  }
}