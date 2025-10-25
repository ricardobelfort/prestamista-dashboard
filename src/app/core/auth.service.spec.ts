import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

describe('AuthService', () => {
  let service: AuthService;
  let supabaseServiceMock: any;
  let routerMock: jest.Mocked<Router>;
  let authMock: any;

  beforeEach(() => {
    // Create auth mock
    authMock = {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    };

    // Create supabase mock
    supabaseServiceMock = {
      client: {
        auth: authMock,
      },
    };

    // Create router mock
    routerMock = {
      navigate: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signIn', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      authMock.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await service.signIn(email, password);

      expect(authMock.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
      expect(authMock.signInWithPassword).toHaveBeenCalledTimes(1);
    });

    it('should throw error if sign in fails', async () => {
      const error = new Error('Invalid credentials');
      authMock.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error,
      });

      await expect(service.signIn('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('should clear user cache after successful sign in', async () => {
      authMock.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      // First set cache
      authMock.getUser.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });
      await service.getUser();

      // Then sign in should clear it
      await service.signIn('test@example.com', 'password');

      // Verify cache is cleared by checking a new call is made
      await service.getUser();
      expect(authMock.getUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('signOut', () => {
    it('should call signOut and navigate to login', async () => {
      authMock.signOut.mockResolvedValue({ error: null });

      await service.signOut();

      expect(authMock.signOut).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should clear user cache after sign out', async () => {
      authMock.signOut.mockResolvedValue({ error: null });

      // Set cache first
      authMock.getUser.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });
      await service.getUser();

      // Sign out
      await service.signOut();

      // Cache should be cleared
      await service.getUser();
      expect(authMock.getUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUser', () => {
    it('should return cached user if cache is valid', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      authMock.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // First call - fetches from server
      const user1 = await service.getUser();
      expect(user1).toEqual(mockUser);
      expect(authMock.getUser).toHaveBeenCalledTimes(1);

      // Second call within cache duration - returns cached
      const user2 = await service.getUser();
      expect(user2).toEqual(mockUser);
      expect(authMock.getUser).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should fetch new user if cache expired', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      authMock.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // First call
      await service.getUser();
      expect(authMock.getUser).toHaveBeenCalledTimes(1);

      // Mock time passage (31 seconds - cache is 30s)
      jest.useFakeTimers();
      jest.advanceTimersByTime(31000);

      // Second call after cache expiry
      await service.getUser();
      expect(authMock.getUser).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should return null if user is not authenticated', async () => {
      authMock.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const user = await service.getUser();
      expect(user).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should return session if exists', async () => {
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: '123' },
      };
      authMock.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const session = await service.getSession();
      expect(session).toBeTruthy();
      expect(session?.access_token).toBe('token123');
    });

    it('should return null if no session', async () => {
      authMock.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const session = await service.getSession();
      expect(session).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should register callback for auth state changes', () => {
      const callback = jest.fn();
      authMock.onAuthStateChange.mockReturnValue({
        data: { subscription: {} },
      });

      service.onAuthStateChange(callback);

      expect(authMock.onAuthStateChange).toHaveBeenCalled();
    });

    it('should update cache when auth state changes', () => {
      const callback = jest.fn();
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser };

      // Capture the callback passed to onAuthStateChange
      let authCallback: any;
      authMock.onAuthStateChange.mockImplementation((cb: any) => {
        authCallback = cb;
        return { data: { subscription: {} } };
      });

      service.onAuthStateChange(callback);

      // Simulate auth state change
      authCallback('SIGNED_IN', mockSession);

      expect(callback).toHaveBeenCalledWith(mockUser);
    });

    it('should call callback with null when user signs out', () => {
      const callback = jest.fn();

      let authCallback: any;
      authMock.onAuthStateChange.mockImplementation((cb: any) => {
        authCallback = cb;
        return { data: { subscription: {} } };
      });

      service.onAuthStateChange(callback);

      // Simulate sign out
      authCallback('SIGNED_OUT', null);

      expect(callback).toHaveBeenCalledWith(null);
    });
  });

  describe('cache management', () => {
    it('should clear cache when clearUserCache is called', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      authMock.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Set cache
      await service.getUser();
      expect(authMock.getUser).toHaveBeenCalledTimes(1);

      // Clear cache via signIn
      authMock.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });
      await service.signIn('test@example.com', 'password');

      // Next getUser should fetch again
      await service.getUser();
      expect(authMock.getUser).toHaveBeenCalledTimes(2);
    });

    it('should cache user for 30 seconds', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      authMock.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      jest.useFakeTimers();

      // First call
      await service.getUser();
      expect(authMock.getUser).toHaveBeenCalledTimes(1);

      // 29 seconds later - still cached
      jest.advanceTimersByTime(29000);
      await service.getUser();
      expect(authMock.getUser).toHaveBeenCalledTimes(1);

      // 31 seconds later - cache expired
      jest.advanceTimersByTime(2000);
      await service.getUser();
      expect(authMock.getUser).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });
});
