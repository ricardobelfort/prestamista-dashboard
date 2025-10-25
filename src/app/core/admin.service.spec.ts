import { TestBed } from '@angular/core/testing';
import { AdminService, Organization, OrganizationMember, CreateOrganizationData, SystemUser, OrganizationDeleteImpact } from './admin.service';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';

describe('AdminService', () => {
  let service: AdminService;
  let supabaseServiceMock: any;
  let toastServiceMock: any;
  let clientMock: any;

  beforeEach(() => {
    // Mock básico do client
    clientMock = {
      rpc: jest.fn(),
      functions: {
        invoke: jest.fn(),
      },
      from: jest.fn(),
    };

    supabaseServiceMock = {
      client: clientMock,
    };

    toastServiceMock = {
      error: jest.fn(),
      success: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AdminService,
        { provide: SupabaseService, useValue: supabaseServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    });

    service = TestBed.inject(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =============================================
  // ORGANIZAÇÕES
  // =============================================

  describe('listOrganizations', () => {
    it('should list all organizations using RPC', async () => {
      const mockOrgs: Organization[] = [
        { id: '1', name: 'Org 1', created_at: '2024-01-01' },
        { id: '2', name: 'Org 2', created_at: '2024-01-02' },
      ];

      clientMock.rpc.mockResolvedValue({
        data: mockOrgs,
        error: null,
      });

      const result = await service.listOrganizations();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_list_organizations');
      expect(result).toEqual(mockOrgs);
      expect(toastServiceMock.error).not.toHaveBeenCalled();
    });

    it('should return empty array if RPC returns null data', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.listOrganizations();

      expect(result).toEqual([]);
    });

    it('should throw error and show toast if RPC fails', async () => {
      const error = { message: 'RPC error' };
      clientMock.rpc.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.listOrganizations()).rejects.toThrow('RPC error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao carregar organizações: RPC error');
    });

    it('should handle unexpected exceptions', async () => {
      clientMock.rpc.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.listOrganizations()).rejects.toThrow('Unexpected error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao carregar organizações');
    });
  });

  describe('createOrganization', () => {
    it('should create organization via Edge Function', async () => {
      const orgData: CreateOrganizationData = {
        name: 'New Org',
        owner_email: 'owner@test.com',
        owner_name: 'Owner Name',
      };

      const mockOrg: Organization = {
        id: '123',
        name: 'New Org',
        created_at: '2024-01-01',
      };

      clientMock.functions.invoke.mockResolvedValue({
        data: { organization: mockOrg },
        error: null,
      });

      const result = await service.createOrganization(orgData);

      expect(clientMock.functions.invoke).toHaveBeenCalledWith('create-organization', {
        body: {
          name: 'New Org',
          owner_email: 'owner@test.com',
          owner_name: 'Owner Name',
        },
      });
      expect(result).toEqual(mockOrg);
      expect(toastServiceMock.success).toHaveBeenCalledWith('Organização "New Org" criada com sucesso!');
    });

    it('should throw error if Edge Function returns error', async () => {
      const orgData: CreateOrganizationData = {
        name: 'New Org',
        owner_email: 'owner@test.com',
        owner_name: 'Owner Name',
      };

      clientMock.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Function error' },
      });

      await expect(service.createOrganization(orgData)).rejects.toThrow('Function error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao criar organização: Function error');
    });

    it('should throw error if data contains error property', async () => {
      const orgData: CreateOrganizationData = {
        name: 'New Org',
        owner_email: 'owner@test.com',
        owner_name: 'Owner Name',
      };

      clientMock.functions.invoke.mockResolvedValue({
        data: { error: 'Custom error' },
        error: null,
      });

      await expect(service.createOrganization(orgData)).rejects.toThrow('Custom error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao criar organização: Custom error');
    });

    it('should handle unexpected exceptions', async () => {
      const orgData: CreateOrganizationData = {
        name: 'New Org',
        owner_email: 'owner@test.com',
        owner_name: 'Owner Name',
      };

      clientMock.functions.invoke.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.createOrganization(orgData)).rejects.toThrow('Unexpected error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao criar organização');
    });
  });

  describe('updateOrganization', () => {
    it('should update organization', async () => {
      const updates = { name: 'Updated Org' };
      const mockOrg: Organization = {
        id: '123',
        name: 'Updated Org',
        created_at: '2024-01-01',
      };

      const queryMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockOrg,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(queryMock);

      const result = await service.updateOrganization('123', updates);

      expect(clientMock.from).toHaveBeenCalledWith('orgs');
      expect(queryMock.update).toHaveBeenCalledWith(updates);
      expect(queryMock.eq).toHaveBeenCalledWith('id', '123');
      expect(result).toEqual(mockOrg);
      expect(toastServiceMock.success).toHaveBeenCalledWith('Organização atualizada com sucesso!');
    });

    it('should throw error if update fails', async () => {
      const updates = { name: 'Updated Org' };

      const queryMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update error' },
        }),
      };

      clientMock.from.mockReturnValue(queryMock);

      await expect(service.updateOrganization('123', updates)).rejects.toThrow('Update error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao atualizar organização: Update error');
    });

    it('should handle unexpected exceptions', async () => {
      const updates = { name: 'Updated Org' };

      clientMock.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(service.updateOrganization('123', updates)).rejects.toThrow('Unexpected error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao atualizar organização');
    });
  });

  describe('deleteOrganization', () => {
    it('should delete organization via RPC', async () => {
      clientMock.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await service.deleteOrganization('123');

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_delete_organization', {
        org_id_param: '123',
      });
      expect(result).toBe(true);
      expect(toastServiceMock.success).toHaveBeenCalledWith('Organização excluída com sucesso!');
    });

    it('should show detailed error for organization with data', async () => {
      const error = { message: 'Organização possui dados e não pode ser excluída' };
      clientMock.rpc.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.deleteOrganization('123')).rejects.toThrow(error.message);
      expect(toastServiceMock.error).toHaveBeenCalledWith(
        'Não é possível excluir esta organização porque ela possui dados registrados. ' +
        'Por favor, remova todos os clientes, empréstimos e rotas antes de excluir a organização.'
      );
    });

    it('should show generic error for other failures', async () => {
      const error = { message: 'Generic error' };
      clientMock.rpc.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.deleteOrganization('123')).rejects.toThrow('Generic error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao excluir organização: Generic error');
    });
  });

  // =============================================
  // MEMBROS DA ORGANIZAÇÃO
  // =============================================

  describe('getOrganizationMembers', () => {
    it('should get organization members via RPC', async () => {
      const mockMembers = [
        {
          org_id: '123',
          user_id: 'user1',
          role: 'admin',
          user_name: 'User 1',
          user_email: 'user1@test.com',
        },
        {
          org_id: '123',
          user_id: 'user2',
          role: 'viewer',
          user_name: 'User 2',
          user_email: 'user2@test.com',
        },
      ];

      clientMock.rpc.mockResolvedValue({
        data: mockMembers,
        error: null,
      });

      const result = await service.getOrganizationMembers('123');

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_list_org_members', {
        org_id_param: '123',
      });
      expect(result).toEqual(mockMembers);
    });

    it('should return empty array if RPC returns null', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.getOrganizationMembers('123');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      const result = await service.getOrganizationMembers('123');

      expect(result).toEqual([]);
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao carregar membros: RPC error');
    });

    it('should handle unexpected exceptions', async () => {
      clientMock.rpc.mockRejectedValue(new Error('Unexpected error'));

      const result = await service.getOrganizationMembers('123');

      expect(result).toEqual([]);
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao carregar membros');
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role via RPC', async () => {
      clientMock.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await service.updateMemberRole('123', 'user1', 'admin');

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_update_member_role', {
        org_id_param: '123',
        user_id_param: 'user1',
        new_role_param: 'admin',
      });
      expect(result).toBe(true);
      expect(toastServiceMock.success).toHaveBeenCalledWith('Permissões atualizadas com sucesso!');
    });

    it('should throw error if RPC fails', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      await expect(service.updateMemberRole('123', 'user1', 'admin')).rejects.toThrow('RPC error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao atualizar permissões: RPC error');
    });

    it('should handle unexpected exceptions', async () => {
      clientMock.rpc.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.updateMemberRole('123', 'user1', 'admin')).rejects.toThrow('Unexpected error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao atualizar permissões');
    });
  });

  describe('removeMember', () => {
    it('should remove member via RPC', async () => {
      clientMock.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await service.removeMember('123', 'user1');

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_remove_member', {
        org_id_param: '123',
        user_id_param: 'user1',
      });
      expect(result).toBe(true);
      expect(toastServiceMock.success).toHaveBeenCalledWith('Membro removido com sucesso!');
    });

    it('should throw error if RPC fails', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      await expect(service.removeMember('123', 'user1')).rejects.toThrow('RPC error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao remover membro: RPC error');
    });

    it('should handle unexpected exceptions', async () => {
      clientMock.rpc.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.removeMember('123', 'user1')).rejects.toThrow('Unexpected error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao remover membro');
    });
  });

  // =============================================
  // CONVITES
  // =============================================

  describe('inviteUser', () => {
    it('should invite user via Edge Function', async () => {
      clientMock.functions.invoke.mockResolvedValue({
        data: { userExists: false },
        error: null,
      });

      await service.inviteUser('123', 'newuser@test.com', 'viewer', 'New User');

      expect(clientMock.functions.invoke).toHaveBeenCalledWith('invite-user', {
        body: {
          org_id: '123',
          email: 'newuser@test.com',
          role: 'viewer',
          name: 'New User',
        },
      });
      expect(toastServiceMock.success).toHaveBeenCalledWith('Convite enviado por email com sucesso!');
    });

    it('should show different message when user already exists', async () => {
      clientMock.functions.invoke.mockResolvedValue({
        data: { userExists: true },
        error: null,
      });

      await service.inviteUser('123', 'existing@test.com', 'viewer');

      expect(toastServiceMock.success).toHaveBeenCalledWith('Usuário adicionado à organização com sucesso!');
    });

    it('should throw error if user already member', async () => {
      clientMock.functions.invoke.mockResolvedValue({
        data: { error: 'User already member', alreadyMember: true },
        error: null,
      });

      await expect(service.inviteUser('123', 'member@test.com', 'viewer')).rejects.toThrow('User already member');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Este usuário já é membro desta organização');
    });

    it('should throw error if Edge Function returns error', async () => {
      clientMock.functions.invoke.mockResolvedValue({
        data: { error: 'Custom error' },
        error: null,
      });

      await expect(service.inviteUser('123', 'user@test.com', 'viewer')).rejects.toThrow('Custom error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao enviar convite: Custom error');
    });

    it('should handle invocation error', async () => {
      clientMock.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Invocation error' },
      });

      await expect(service.inviteUser('123', 'user@test.com', 'viewer')).rejects.toThrow('Invocation error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao enviar convite: Invocation error');
    });

    it('should handle unexpected exceptions', async () => {
      clientMock.functions.invoke.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.inviteUser('123', 'user@test.com', 'viewer')).rejects.toThrow('Unexpected error');
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao enviar convite');
    });
  });

  // =============================================
  // ESTATÍSTICAS ADMINISTRATIVAS
  // =============================================

  describe('getAdminStats', () => {
    it('should get admin stats via RPC', async () => {
      const mockStats = {
        total_organizations: 10,
        total_users: 50,
        total_loans: 200,
      };

      clientMock.rpc.mockResolvedValue({
        data: [mockStats],
        error: null,
      });

      const result = await service.getAdminStats();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_admin_stats');
      expect(result).toEqual(mockStats);
    });

    it('should return default stats if RPC returns empty array', async () => {
      clientMock.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await service.getAdminStats();

      expect(result).toEqual({
        total_organizations: 0,
        total_users: 0,
        total_loans: 0,
      });
    });

    it('should return default stats on error', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      const result = await service.getAdminStats();

      expect(result).toEqual({
        total_organizations: 0,
        total_users: 0,
        total_loans: 0,
      });
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao carregar estatísticas: RPC error');
    });

    it('should handle unexpected exceptions', async () => {
      clientMock.rpc.mockRejectedValue(new Error('Unexpected error'));

      const result = await service.getAdminStats();

      expect(result).toEqual({
        total_organizations: 0,
        total_users: 0,
        total_loans: 0,
      });
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao carregar estatísticas');
    });
  });

  // =============================================
  // GERENCIAMENTO DE USUÁRIOS DO SISTEMA
  // =============================================

  describe('listAllUsers', () => {
    it('should list all users via RPC', async () => {
      const mockUsers: SystemUser[] = [
        {
          user_id: 'user1',
          email: 'user1@test.com',
          full_name: 'User One',
          created_at: '2024-01-01',
          last_sign_in_at: '2024-01-02',
          email_confirmed_at: '2024-01-01',
          is_active: true,
          default_org: 'org1',
          default_org_name: 'Org 1',
          total_organizations: 2,
          organizations: 'Org 1, Org 2',
          roles: 'admin, viewer',
        },
      ];

      clientMock.rpc.mockResolvedValue({
        data: mockUsers,
        error: null,
      });

      const result = await service.listAllUsers();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_list_all_users');
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array if RPC returns null', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.listAllUsers();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      const result = await service.listAllUsers();

      expect(result).toEqual([]);
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao carregar usuários: RPC error');
    });

    it('should handle unexpected exceptions', async () => {
      clientMock.rpc.mockRejectedValue(new Error('Unexpected error'));

      const result = await service.listAllUsers();

      expect(result).toEqual([]);
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao carregar usuários');
    });
  });

  describe('checkOrganizationDeleteImpact', () => {
    it('should check organization delete impact via RPC', async () => {
      const mockImpact: OrganizationDeleteImpact = {
        organization: {
          id: '123',
          name: 'Test Org',
          created_at: '2024-01-01',
        },
        data: {
          clients: 5,
          loans: 10,
          payments: 20,
          routes: 3,
          has_data: true,
        },
        members: [
          {
            user_id: 'user1',
            email: 'user1@test.com',
            full_name: 'User One',
            role: 'admin',
            is_default_org: true,
            total_orgs: 2,
            will_be_orphan: false,
          },
        ],
      };

      clientMock.rpc.mockResolvedValue({
        data: mockImpact,
        error: null,
      });

      const result = await service.checkOrganizationDeleteImpact('123');

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_check_organization_delete_impact', {
        org_id_param: '123',
      });
      expect(result).toEqual(mockImpact);
    });

    it('should return null on error', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      const result = await service.checkOrganizationDeleteImpact('123');

      expect(result).toBeNull();
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao verificar impacto: RPC error');
    });

    it('should handle unexpected exceptions', async () => {
      clientMock.rpc.mockRejectedValue(new Error('Unexpected error'));

      const result = await service.checkOrganizationDeleteImpact('123');

      expect(result).toBeNull();
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao verificar impacto');
    });
  });

  describe('deleteUsers', () => {
    it('should delete users via RPC', async () => {
      const mockResult = {
        success: true,
        deleted_count: 2,
        message: '2 usuários excluídos',
      };

      clientMock.rpc.mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await service.deleteUsers(['user1', 'user2']);

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_delete_users', {
        user_ids_param: ['user1', 'user2'],
      });
      expect(result).toEqual(mockResult);
    });

    it('should return null on error', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      const result = await service.deleteUsers(['user1', 'user2']);

      expect(result).toBeNull();
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao excluir usuários: RPC error');
    });

    it('should handle unexpected exceptions', async () => {
      clientMock.rpc.mockRejectedValue(new Error('Unexpected error'));

      const result = await service.deleteUsers(['user1', 'user2']);

      expect(result).toBeNull();
      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro inesperado ao excluir usuários');
    });
  });
});
