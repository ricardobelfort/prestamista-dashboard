import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';
import { of } from 'rxjs';

describe('DataService', () => {
  let service: DataService;
  let supabaseServiceMock: any;
  let toastServiceMock: any;
  let authMock: any;
  let clientMock: any;

  beforeEach(() => {
    // Mock do auth
    authMock = {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
    };

    // Mock do client do Supabase
    clientMock = {
      auth: authMock,
      rpc: jest.fn(),
      from: jest.fn(),
    };

    // Mock do SupabaseService
    supabaseServiceMock = {
      client: clientMock,
    };

    // Mock do ToastService
    toastServiceMock = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
      showWarning: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DataService,
        { provide: SupabaseService, useValue: supabaseServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    });

    service = TestBed.inject(DataService);

    // Setup padrão: usuário autenticado
    authMock.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@test.com' } },
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =============================================
  // TESTES DE AUTENTICAÇÃO
  // =============================================

  describe('ensureAuthenticated', () => {
    it('should not sign in if user is already authenticated', async () => {
      authMock.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      clientMock.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.listClients();

      expect(authMock.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should auto sign in with debug user if not authenticated', async () => {
      authMock.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      authMock.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'debug-user' } },
        error: null,
      });

      clientMock.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      localStorage.setItem('debug_user', 'debug@test.com');

      await service.listClients();

      expect(authMock.signInWithPassword).toHaveBeenCalledWith({
        email: 'debug@test.com',
        password: '123456',
      });

      localStorage.removeItem('debug_user');
    });

    it('should throw error if auto sign in fails', async () => {
      authMock.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      authMock.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      await expect(service.listClients()).rejects.toThrow(
        'Authentication failed - unable to login with development credentials'
      );
    });
  });

  // =============================================
  // TESTES DE LISTAGEM
  // =============================================

  describe('listClients', () => {
    it('should list active clients with routes', async () => {
      const mockClients = [
        {
          id: '1',
          name: 'Cliente A',
          status: 'active',
          route_id: 'route-1',
        },
        {
          id: '2',
          name: 'Cliente B',
          status: 'active',
          route_id: null,
        },
        {
          id: '3',
          name: 'Cliente C',
          status: 'inactive',
          route_id: null,
        },
      ];

      const mockRoute = {
        id: 'route-1',
        name: 'Rota Norte',
        assigned_to: 'user-123',
      };

      clientMock.rpc.mockResolvedValue({
        data: mockClients,
        error: null,
      });

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockRoute,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.listClients();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_list_clients');
      expect(result).toHaveLength(2); // Apenas clientes ativos
      expect(result[0].routes).toEqual(mockRoute);
      expect(result[1].routes).toBeNull();
    });

    it('should sort clients by name', async () => {
      const mockClients = [
        { id: '1', name: 'Zé', status: 'active', route_id: null },
        { id: '2', name: 'Ana', status: 'active', route_id: null },
        { id: '3', name: 'Maria', status: 'active', route_id: null },
      ];

      clientMock.rpc.mockResolvedValue({
        data: mockClients,
        error: null,
      });

      const result = await service.listClients();

      expect(result[0].name).toBe('Ana');
      expect(result[1].name).toBe('Maria');
      expect(result[2].name).toBe('Zé');
    });

    it('should throw error if RPC fails', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.listClients()).rejects.toThrow('Database error');
    });

    it('should handle route fetch errors gracefully', async () => {
      const mockClients = [
        { id: '1', name: 'Cliente A', status: 'active', route_id: 'route-1' },
      ];

      clientMock.rpc.mockResolvedValue({
        data: mockClients,
        error: null,
      });

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Route not found')),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.listClients();

      expect(result[0].routes).toBeNull();
    });
  });

  describe('listLoans', () => {
    it('should list all loans', async () => {
      const mockLoans = [
        { id: '1', principal: 1000, client_id: 'c1' },
        { id: '2', principal: 2000, client_id: 'c2' },
      ];

      clientMock.rpc.mockResolvedValue({
        data: mockLoans,
        error: null,
      });

      const result = await service.listLoans();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_list_loans');
      expect(result).toEqual(mockLoans);
    });

    it('should return empty array if no loans', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.listLoans();

      expect(result).toEqual([]);
    });

    it('should throw error if RPC fails', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      await expect(service.listLoans()).rejects.toThrow('RPC error');
    });
  });

  describe('listPayments', () => {
    it('should list all payments', async () => {
      const mockPayments = [
        { id: '1', value: 100, method: 'cash' },
        { id: '2', value: 200, method: 'pix' },
      ];

      clientMock.rpc.mockResolvedValue({
        data: mockPayments,
        error: null,
      });

      const result = await service.listPayments();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_list_payments');
      expect(result).toEqual(mockPayments);
    });

    it('should return empty array if no payments', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.listPayments();

      expect(result).toEqual([]);
    });
  });

  describe('listRoutes', () => {
    it('should list all routes with profile data', async () => {
      const mockRoutes = [
        {
          id: '1',
          name: 'Rota Norte',
          assigned_to: 'user-1',
          assigned_user_name: 'João Silva',
          created_at: '2024-01-01',
        },
        {
          id: '2',
          name: 'Rota Sul',
          assigned_to: null,
          assigned_user_name: null,
          created_at: '2024-01-02',
        },
      ];

      clientMock.rpc.mockResolvedValue({
        data: mockRoutes,
        error: null,
      });

      const result = await service.listRoutes();

      expect(result[0].profiles).toEqual({ full_name: 'João Silva' });
      expect(result[1].profiles).toBeNull();
    });

    it('should return empty array on error', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Error' },
      });

      const result = await service.listRoutes();

      expect(result).toEqual([]);
    });

    it('should handle exceptions gracefully', async () => {
      clientMock.rpc.mockRejectedValue(new Error('Network error'));

      const result = await service.listRoutes();

      expect(result).toEqual([]);
    });
  });

  describe('listInstallments', () => {
    it('should list all installments ordered by due date', async () => {
      const mockInstallments = [
        {
          id: '1',
          loan_id: 'loan-1',
          due_date: '2024-01-15',
          loans: { id: 'loan-1', client_id: 'c1', clients: { name: 'Cliente A' } },
        },
      ];

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockInstallments,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.listInstallments();

      expect(clientMock.from).toHaveBeenCalledWith('installments');
      expect(fromMock.order).toHaveBeenCalledWith('due_date', { ascending: true });
      expect(result).toEqual(mockInstallments);
    });

  it('should filter by loan_id when provided', async () => {
    // Criar queryMock que suporta .order() retornando algo que tem .eq()
    const queryAfterEq = {
      // Não precisa de nada aqui - será resolvido como Promise
    };

    const queryAfterOrder: any = {
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    const queryMock: any = {
      order: jest.fn().mockReturnValue(queryAfterOrder),
    };

    const fromMock = {
      select: jest.fn().mockReturnValue(queryMock),
    };

    clientMock.from.mockReturnValue(fromMock);

    await service.listInstallments(123);

    expect(queryMock.order).toHaveBeenCalledWith('due_date', { ascending: true });
    expect(queryAfterOrder.eq).toHaveBeenCalledWith('loan_id', 123);
  });    it('should throw error if query fails', async () => {
      const fromMock = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query error' },
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      await expect(service.listInstallments()).rejects.toThrow('Query error');
    });
  });

  // =============================================
  // TESTES DE DASHBOARD
  // =============================================

  describe('getDashboardMetrics', () => {
    it('should get dashboard metrics for user org', async () => {
      const mockProfile = { default_org: 'org-123' };
      const mockMetrics = {
        total_clients: 100,
        total_loans: 50,
        total_overdue: 10,
      };

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);
      clientMock.rpc.mockResolvedValue({
        data: mockMetrics,
        error: null,
      });

      const result = await service.getDashboardMetrics();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_get_dashboard_metrics', {
        p_org_id: 'org-123',
      });
      expect(result).toEqual(mockMetrics);
    });

    it('should throw error if user not authenticated', async () => {
      authMock.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      authMock.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Auth failed' },
      });

      await expect(service.getDashboardMetrics()).rejects.toThrow();
    });

    it('should throw error if org not found', async () => {
      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { default_org: null },
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      await expect(service.getDashboardMetrics()).rejects.toThrow('Organization not found');
    });
  });

  describe('getMonthlyEvolution', () => {
    it('should get monthly evolution with default 6 months', async () => {
      const mockProfile = { default_org: 'org-123' };
      const mockEvolution = [
        { month: '2024-01', total: 1000 },
        { month: '2024-02', total: 1500 },
      ];

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);
      clientMock.rpc.mockResolvedValue({
        data: mockEvolution,
        error: null,
      });

      const result = await service.getMonthlyEvolution();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_get_monthly_evolution', {
        p_org_id: 'org-123',
        p_months: 6,
      });
      expect(result).toEqual(mockEvolution);
    });

    it('should accept custom months parameter', async () => {
      const mockProfile = { default_org: 'org-123' };

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);
      clientMock.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.getMonthlyEvolution(12);

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_get_monthly_evolution', {
        p_org_id: 'org-123',
        p_months: 12,
      });
    });

    it('should return empty array on error', async () => {
      const mockProfile = { default_org: 'org-123' };

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Error' },
      });

      await expect(service.getMonthlyEvolution()).rejects.toThrow('Error');
    });
  });

  describe('getUpcomingInstallments', () => {
    it('should get upcoming installments with default 7 days', async () => {
      const mockProfile = { default_org: 'org-123' };
      const mockInstallments = [
        { id: '1', due_date: '2024-01-15', amount: 100 },
        { id: '2', due_date: '2024-01-20', amount: 200 },
      ];

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);
      clientMock.rpc.mockResolvedValue({
        data: mockInstallments,
        error: null,
      });

      const result = await service.getUpcomingInstallments();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_get_upcoming_installments', {
        p_org_id: 'org-123',
        p_days: 7,
      });
      expect(result).toEqual(mockInstallments);
    });

    it('should accept custom days parameter', async () => {
      const mockProfile = { default_org: 'org-123' };

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);
      clientMock.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.getUpcomingInstallments(30);

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_get_upcoming_installments', {
        p_org_id: 'org-123',
        p_days: 30,
      });
    });
  });

  describe('getClientFinancialHistory', () => {
    it('should get financial history for client', async () => {
      const mockProfile = { default_org: 'org-123' };
      const mockHistory = {
        summary: { total_borrowed: 5000, total_paid: 3000 },
        loans: [{ id: '1', principal: 1000 }],
      };

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);
      clientMock.rpc.mockResolvedValue({
        data: mockHistory,
        error: null,
      });

      const result = await service.getClientFinancialHistory('client-123');

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_get_client_financial_history', {
        p_org_id: 'org-123',
        p_client_id: 'client-123',
      });
      expect(result).toEqual(mockHistory);
    });

    it('should return default structure on error', async () => {
      const mockProfile = { default_org: 'org-123' };

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Error' },
      });

      await expect(service.getClientFinancialHistory('client-123')).rejects.toThrow('Error');
    });
  });

  // =============================================
  // TESTES DE PERFIL E ROLE
  // =============================================

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const mockProfile = {
        full_name: 'João Silva',
        default_org: 'org-123',
      };

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.getProfile();

      expect(result).toEqual(mockProfile);
    });

    it('should return default name on error', async () => {
      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.getProfile();

      expect(result).toEqual({ full_name: 'Usuário' });
    });

    it('should handle exceptions gracefully', async () => {
      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.getProfile();

      expect(result).toEqual({ full_name: 'Usuário' });
    });
  });

  describe('getCurrentUserRole', () => {
    it('should get user role from RPC', async () => {
      clientMock.rpc.mockResolvedValue({
        data: 'admin',
        error: null,
      });

      const result = await service.getCurrentUserRole();

      expect(clientMock.rpc).toHaveBeenCalledWith('fn_get_user_role');
      expect(result).toBe('admin');
    });

    it('should cache role for 60 seconds', async () => {
      clientMock.rpc.mockResolvedValue({
        data: 'admin',
        error: null,
      });

      const result1 = await service.getCurrentUserRole();
      const result2 = await service.getCurrentUserRole();

      expect(clientMock.rpc).toHaveBeenCalledTimes(1);
      expect(result1).toBe('admin');
      expect(result2).toBe('admin');
    });

    it('should refresh cache after 60 seconds', async () => {
      jest.useFakeTimers();

      clientMock.rpc.mockResolvedValue({
        data: 'admin',
        error: null,
      });

      await service.getCurrentUserRole();

      jest.advanceTimersByTime(61000); // 61 segundos

      clientMock.rpc.mockResolvedValue({
        data: 'editor',
        error: null,
      });

      const result = await service.getCurrentUserRole();

      expect(clientMock.rpc).toHaveBeenCalledTimes(2);
      expect(result).toBe('editor');

      jest.useRealTimers();
    });

    it('should return viewer on error', async () => {
      clientMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      const result = await service.getCurrentUserRole();

      expect(result).toBe('viewer');
    });

    it('should return viewer if user not authenticated', async () => {
      authMock.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      authMock.signInWithPassword.mockRejectedValue(new Error('Auth failed'));

      const result = await service.getCurrentUserRole();

      expect(result).toBe('viewer');
    });
  });

  describe('clearRoleCache', () => {
    it('should clear role cache', async () => {
      clientMock.rpc.mockResolvedValue({
        data: 'admin',
        error: null,
      });

      await service.getCurrentUserRole();

      service.clearRoleCache();

      clientMock.rpc.mockResolvedValue({
        data: 'editor',
        error: null,
      });

      const result = await service.getCurrentUserRole();

      expect(clientMock.rpc).toHaveBeenCalledTimes(2);
      expect(result).toBe('editor');
    });
  });

  // =============================================
  // TESTES DE CRUD - CREATE
  // =============================================

  describe('createClient', () => {
    it('should create client with provided org_id', async () => {
      const newClient = {
        name: 'Novo Cliente',
        phone: '123456789',
        address: 'Rua A',
        doc_id: 'DOC123',
        route_id: 'route-1',
        org_id: 'org-123',
      };

      const mockResult = { id: 'client-1', ...newClient };

      const fromMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockResult,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.createClient(newClient);

      expect(clientMock.from).toHaveBeenCalledWith('clients');
      expect(result).toEqual(mockResult);
    });

    it('should auto-fetch org_id if not provided', async () => {
      const newClient = {
        name: 'Novo Cliente',
        phone: '123456789',
      };

      const mockProfile = { default_org: 'org-auto' };

      const profileMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      const insertMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'client-1', ...newClient, org_id: 'org-auto' },
          error: null,
        }),
      };

      clientMock.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profileMock;
        if (table === 'clients') return insertMock;
        return null;
      });

      await service.createClient(newClient);

      expect(insertMock.insert).toHaveBeenCalledWith([
        expect.objectContaining({ org_id: 'org-auto' }),
      ]);
    });

    it('should throw error if insert fails', async () => {
      const newClient = { name: 'Test', org_id: 'org-1' };

      const fromMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      await expect(service.createClient(newClient)).rejects.toThrow('Insert failed');
    });
  });

  describe('createLoan', () => {
    it('should create loan with installments via RPC', async () => {
      const newLoan = {
        client_id: 'client-1',
        principal: 1000,
        interest_rate: 5,
        start_date: '2024-01-01',
        installments_count: 12,
        notes: 'Test loan',
      };

      const mockProfile = { default_org: 'org-123' };

      const profileMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(profileMock);
      clientMock.rpc.mockResolvedValue({
        data: { id: 'loan-1' },
        error: null,
      });

      const result = await service.createLoan(newLoan);

      expect(clientMock.rpc).toHaveBeenCalledWith('create_loan_with_installments', {
        p_org_id: 'org-123',
        p_client_id: 'client-1',
        p_principal: 1000,
        p_interest_rate: 5,
        p_start_date: '2024-01-01',
        p_installments_count: 12,
        p_notes: 'Test loan',
      });
      expect(result).toEqual({ id: 'loan-1' });
    });

    it('should default interest_rate to 0 if not provided', async () => {
      const newLoan = {
        client_id: 'client-1',
        principal: 1000,
        start_date: '2024-01-01',
        installments_count: 12,
      };

      const mockProfile = { default_org: 'org-123' };

      const profileMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(profileMock);
      clientMock.rpc.mockResolvedValue({
        data: { id: 'loan-1' },
        error: null,
      });

      await service.createLoan(newLoan);

      expect(clientMock.rpc).toHaveBeenCalledWith(
        'create_loan_with_installments',
        expect.objectContaining({
          p_interest_rate: 0,
          p_notes: '',
        })
      );
    });

    it('should throw error if org not found', async () => {
      const newLoan = { client_id: 'c1', principal: 1000 };

      const profileMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { default_org: null },
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(profileMock);

      await expect(service.createLoan(newLoan)).rejects.toThrow('Organization not found');
    });
  });

  describe('createPayment', () => {
    it('should create payment with org_id', async () => {
      const newPayment = {
        installment_id: 'inst-1',
        value: 100,
        method: 'pix',
        paid_on: '2024-01-01',
        notes: 'Test payment',
      };

      const mockProfile = { default_org: 'org-123' };

      const profileMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      const insertMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'payment-1', ...newPayment },
          error: null,
        }),
      };

      clientMock.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profileMock;
        if (table === 'payments') return insertMock;
        return null;
      });

      const result = await service.createPayment(newPayment);

      expect(insertMock.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          org_id: 'org-123',
          installment_id: 'inst-1',
          value: 100,
          method: 'pix',
        }),
      ]);
      expect(result).toEqual({ id: 'payment-1', ...newPayment });
    });

    it('should handle null installment_id', async () => {
      const newPayment = {
        value: 100,
        method: 'cash',
        paid_on: '2024-01-01',
      };

      const mockProfile = { default_org: 'org-123' };

      const profileMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      const insertMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'payment-1' },
          error: null,
        }),
      };

      clientMock.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profileMock;
        if (table === 'payments') return insertMock;
        return null;
      });

      await service.createPayment(newPayment);

      expect(insertMock.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          installment_id: null,
        }),
      ]);
    });
  });

  describe('createRoute', () => {
    it('should create route with org_id', async () => {
      const newRoute = {
        name: 'Rota Norte',
        assigned_to: 'user-1',
        org_id: 'org-123',
      };

      const mockResult = { id: 'route-1', ...newRoute };

      const fromMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockResult,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.createRoute(newRoute);

      expect(result).toEqual(mockResult);
    });

    it('should auto-fetch org_id if not provided', async () => {
      const newRoute = {
        name: 'Rota Sul',
        assigned_to: 'user-2',
      };

      const mockProfile = { default_org: 'org-auto' };

      const profileMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      const insertMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'route-1', ...newRoute, org_id: 'org-auto' },
          error: null,
        }),
      };

      clientMock.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profileMock;
        if (table === 'routes') return insertMock;
        return null;
      });

      await service.createRoute(newRoute);

      expect(insertMock.insert).toHaveBeenCalledWith([
        expect.objectContaining({ org_id: 'org-auto' }),
      ]);
    });
  });

  // =============================================
  // TESTES DE CRUD - UPDATE
  // =============================================

  describe('updateClient', () => {
    it('should update client', async () => {
      const updates = { name: 'Nome Atualizado', phone: '987654321' };
      const mockResult = { id: 'client-1', ...updates };

      const fromMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockResult,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.updateClient('client-1', updates);

      expect(fromMock.update).toHaveBeenCalledWith(updates);
      expect(fromMock.eq).toHaveBeenCalledWith('id', 'client-1');
      expect(result).toEqual(mockResult);
    });

    it('should throw error if update fails', async () => {
      const fromMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      await expect(service.updateClient('client-1', {})).rejects.toThrow('Update failed');
    });
  });

  describe('updateLoan', () => {
    it('should update loan', async () => {
      const updates = { principal: 2000, notes: 'Updated' };
      const mockResult = { id: 'loan-1', ...updates };

      const fromMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockResult,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.updateLoan('loan-1', updates);

      expect(result).toEqual(mockResult);
    });
  });

  describe('updatePayment', () => {
    it('should update payment', async () => {
      const updates = { value: 150, notes: 'Updated payment' };
      const mockResult = { id: 'payment-1', ...updates };

      const fromMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockResult,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.updatePayment('payment-1', updates);

      expect(result).toEqual(mockResult);
    });
  });

  describe('updateRoute', () => {
    it('should update route', async () => {
      const updates = { name: 'Rota Atualizada', assigned_to: 'user-2' };
      const mockResult = { id: 'route-1', ...updates };

      const fromMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockResult,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.updateRoute('route-1', updates);

      expect(result).toEqual(mockResult);
    });
  });

  // =============================================
  // TESTES DE CRUD - DELETE
  // =============================================

  describe('deleteClient', () => {
    it('should delete client', async () => {
      const fromMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.deleteClient('client-1');

      expect(fromMock.delete).toHaveBeenCalled();
      expect(fromMock.eq).toHaveBeenCalledWith('id', 'client-1');
      expect(result).toBe(true);
    });

    it('should throw error if delete fails', async () => {
      const fromMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      await expect(service.deleteClient('client-1')).rejects.toThrow('Delete failed');
    });
  });

  describe('deleteLoan', () => {
    it('should delete loan', async () => {
      const fromMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.deleteLoan('loan-1');

      expect(result).toBe(true);
    });
  });

  describe('deletePayment', () => {
    it('should delete payment', async () => {
      const fromMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.deletePayment('payment-1');

      expect(result).toBe(true);
    });
  });

  describe('deleteRoute', () => {
    it('should delete route', async () => {
      const fromMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.deleteRoute('route-1');

      expect(result).toBe(true);
    });
  });

  // =============================================
  // TESTES ADICIONAIS
  // =============================================

  describe('getInstallmentsDue', () => {
    it('should get overdue installments', async () => {
      const mockInstallments = [
        {
          id: '1',
          due_date: '2024-01-01',
          amount: 100,
          paid_amount: null,
          paid_at: null,
          loans: {
            clients: {
              id: 'c1',
              name: 'Cliente A',
              phone: '123',
            },
          },
        },
      ];

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockInstallments,
          error: null,
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.getInstallmentsDue();

      expect(fromMock.is).toHaveBeenCalledWith('paid_at', null);
      expect(fromMock.lte).toHaveBeenCalledWith('due_date', expect.any(String));
      expect(fromMock.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockInstallments);
    });

    it('should return empty array on error', async () => {
      const fromMock = {
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Error' },
        }),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.getInstallmentsDue();

      expect(result).toEqual([]);
    });

    it('should handle exceptions gracefully', async () => {
      const fromMock = {
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      clientMock.from.mockReturnValue(fromMock);

      const result = await service.getInstallmentsDue();

      expect(result).toEqual([]);
    });
  });
});
