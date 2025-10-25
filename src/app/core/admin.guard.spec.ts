import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { Logger } from './logger.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let dataServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let toastServiceMock: any;

  beforeEach(() => {
    dataServiceMock = {
      getCurrentUserRole: jest.fn(),
    };

    authServiceMock = {
      getUser: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    toastServiceMock = {
      error: jest.fn(),
    };

    // Spy no Logger
    jest.spyOn(Logger, 'security').mockImplementation(() => {});
    jest.spyOn(Logger, 'error').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: DataService, useValue: dataServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    });

    guard = TestBed.inject(AdminGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access for owner role', async () => {
    const mockUser = { id: 'user123', email: 'owner@test.com' };

    authServiceMock.getUser.mockResolvedValue(mockUser);
    dataServiceMock.getCurrentUserRole.mockResolvedValue('owner');

    const result = await guard.canActivate();

    expect(result).toBe(true);
    expect(authServiceMock.getUser).toHaveBeenCalled();
    expect(dataServiceMock.getCurrentUserRole).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(toastServiceMock.error).not.toHaveBeenCalled();
  });

  it('should allow access for admin role', async () => {
    const mockUser = { id: 'user123', email: 'admin@test.com' };

    authServiceMock.getUser.mockResolvedValue(mockUser);
    dataServiceMock.getCurrentUserRole.mockResolvedValue('admin');

    const result = await guard.canActivate();

    expect(result).toBe(true);
    expect(authServiceMock.getUser).toHaveBeenCalled();
    expect(dataServiceMock.getCurrentUserRole).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should deny access for collector role', async () => {
    const mockUser = { id: 'user123', email: 'collector@test.com' };

    authServiceMock.getUser.mockResolvedValue(mockUser);
    dataServiceMock.getCurrentUserRole.mockResolvedValue('collector');

    const result = await guard.canActivate();

    expect(result).toBe(false);
    expect(dataServiceMock.getCurrentUserRole).toHaveBeenCalled();
    expect(Logger.security).toHaveBeenCalledWith(
      'Tentativa de acesso administrativo negada',
      { userId: 'user123', role: 'collector' }
    );
    expect(toastServiceMock.error).toHaveBeenCalledWith(
      'Acesso negado. Você precisa ser administrador para acessar esta área.'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should deny access for viewer role', async () => {
    const mockUser = { id: 'user123', email: 'viewer@test.com' };

    authServiceMock.getUser.mockResolvedValue(mockUser);
    dataServiceMock.getCurrentUserRole.mockResolvedValue('viewer');

    const result = await guard.canActivate();

    expect(result).toBe(false);
    expect(Logger.security).toHaveBeenCalledWith(
      'Tentativa de acesso administrativo negada',
      { userId: 'user123', role: 'viewer' }
    );
    expect(toastServiceMock.error).toHaveBeenCalledWith(
      'Acesso negado. Você precisa ser administrador para acessar esta área.'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should deny access and redirect to login when user is not authenticated', async () => {
    authServiceMock.getUser.mockResolvedValue(null);

    const result = await guard.canActivate();

    expect(result).toBe(false);
    expect(authServiceMock.getUser).toHaveBeenCalled();
    expect(toastServiceMock.error).toHaveBeenCalledWith(
      'Você precisa estar autenticado para acessar esta área.'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(dataServiceMock.getCurrentUserRole).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const mockUser = { id: 'user123', email: 'test@test.com' };
    const error = new Error('Permission check failed');

    authServiceMock.getUser.mockResolvedValue(mockUser);
    dataServiceMock.getCurrentUserRole.mockRejectedValue(error);

    const result = await guard.canActivate();

    expect(result).toBe(false);
    expect(Logger.error).toHaveBeenCalledWith('Erro ao verificar permissões:', error);
    expect(toastServiceMock.error).toHaveBeenCalledWith(
      'Erro ao verificar permissões. Tente novamente.'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle errors when getting user', async () => {
    const error = new Error('Auth error');

    authServiceMock.getUser.mockRejectedValue(error);

    const result = await guard.canActivate();

    expect(result).toBe(false);
    expect(Logger.error).toHaveBeenCalledWith('Erro ao verificar permissões:', error);
    expect(toastServiceMock.error).toHaveBeenCalledWith(
      'Erro ao verificar permissões. Tente novamente.'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
