import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { Logger } from './logger.service';

describe('authGuard', () => {
  let authServiceMock: any;
  let routerMock: any;
  let toastServiceMock: any;

  beforeEach(() => {
    authServiceMock = {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    toastServiceMock = {
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
    };

    // Spy no Logger
    jest.spyOn(Logger, 'error').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when user is authenticated and session is valid', async () => {
    const mockUser = { id: 'user123', email: 'test@test.com' };
    const mockSession = { access_token: 'token123', expires_at: Date.now() + 3600000 };

    authServiceMock.getUser.mockResolvedValue(mockUser);
    authServiceMock.getSession.mockResolvedValue(mockSession);

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
    expect(authServiceMock.getUser).toHaveBeenCalled();
    expect(authServiceMock.getSession).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(toastServiceMock.info).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to login when user is not authenticated', async () => {
    authServiceMock.getUser.mockResolvedValue(null);

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(false);
    expect(authServiceMock.getUser).toHaveBeenCalled();
    expect(toastServiceMock.info).toHaveBeenCalledWith('Você precisa fazer login para continuar.');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should deny access when session is expired', async () => {
    const mockUser = { id: 'user123', email: 'test@test.com' };

    authServiceMock.getUser.mockResolvedValue(mockUser);
    authServiceMock.getSession.mockResolvedValue(null); // Session expired

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(false);
    expect(authServiceMock.getSession).toHaveBeenCalled();
    expect(toastServiceMock.warning).toHaveBeenCalledWith('Sua sessão expirou. Faça login novamente.');
    expect(authServiceMock.signOut).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Auth error');
    authServiceMock.getUser.mockRejectedValue(error);

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(false);
    expect(Logger.error).toHaveBeenCalledWith('Erro ao verificar autenticação:', error);
    expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao verificar autenticação. Faça login novamente.');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
