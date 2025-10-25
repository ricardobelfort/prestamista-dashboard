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
      // IMPORTANTE: Usar função RPC para evitar problemas de stack depth com RLS
      // A consulta direta causa "stack depth limit exceeded" devido a políticas RLS recursivas
      const { data, error } = await this.supabase.client.rpc('fn_list_organizations');
      
      if (error) {
        console.error('Erro ao chamar fn_list_organizations:', error);
        this.toastService.error(`Erro ao carregar organizações: ${error.message}`);
        throw new Error(error.message);
      }
      
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
      // Chamar Edge Function para criar organização com owner
      const { data, error } = await this.supabase.client.functions.invoke('create-organization', {
        body: {
          name: orgData.name,
          owner_email: orgData.owner_email,
          owner_name: orgData.owner_name
        }
      });

      if (error) {
        this.toastService.error(`Erro ao criar organização: ${error.message}`);
        throw new Error(error.message);
      }

      if (data?.error) {
        this.toastService.error(`Erro ao criar organização: ${data.error}`);
        throw new Error(data.error);
      }

      this.toastService.success(`Organização "${orgData.name}" criada com sucesso!`);
      
      // Retornar a organização criada
      return data.organization;
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
      // IMPORTANTE: Usar função RPC para evitar problemas de stack depth com RLS
      // O DELETE direto causa "stack depth limit exceeded" devido a políticas RLS recursivas
      const { data, error } = await this.supabase.client.rpc('fn_delete_organization', {
        org_id_param: id
      });
      
      if (error) {
        // Extrair informações detalhadas do erro
        const errorMessage = error.message;
        
        // Verificar se é erro de organização com dados
        if (errorMessage.includes('possui dados e não pode ser excluída')) {
          // Mensagem mais amigável e detalhada
          this.toastService.error(
            `Não é possível excluir esta organização porque ela possui dados registrados. ` +
            `Por favor, remova todos os clientes, empréstimos e rotas antes de excluir a organização.`
          );
        } else {
          this.toastService.error(`Erro ao excluir organização: ${errorMessage}`);
        }
        throw new Error(errorMessage);
      }
      
      this.toastService.success('Organização excluída com sucesso!');
      return true;
    } catch (err: any) {
      // Não mostrar toast duplicado - o erro já foi tratado no bloco acima
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

  async inviteUser(orgId: string, email: string, role: string, name?: string): Promise<void> {
    try {
      // Chamar Edge Function para enviar convite via Supabase Auth
      const { data, error } = await this.supabase.client.functions.invoke('invite-user', {
        body: {
          org_id: orgId,
          email,
          role,
          name
        }
      });

      // Verificar primeiro se há erro no data (contém a mensagem real)
      if (data?.error) {
        if (data.alreadyMember) {
          this.toastService.error('Este usuário já é membro desta organização');
        } else {
          this.toastService.error(`Erro ao enviar convite: ${data.error}`);
        }
        throw new Error(data.error);
      }

      // Verificar erro genérico da invocação
      if (error) {
        this.toastService.error(`Erro ao enviar convite: ${error.message}`);
        throw new Error(error.message);
      }

      if (data?.userExists) {
        this.toastService.success('Usuário adicionado à organização com sucesso!');
      } else {
        this.toastService.success('Convite enviado por email com sucesso!');
      }
    } catch (err: any) {
      if (!err.message.includes('Erro ao enviar convite')) {
        this.toastService.error('Erro inesperado ao enviar convite');
      }
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