import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase.service';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('SupabaseService', () => {
  let service: SupabaseService;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      auth: {},
      from: jest.fn(),
      rpc: jest.fn(),
      functions: {},
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);

    TestBed.configureTestingModule({
      providers: [SupabaseService],
    });

    service = TestBed.inject(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (window as any)._supabase;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create supabase client with environment config', () => {
    expect(createClient).toHaveBeenCalled();
  });

  it('should return supabase client', () => {
    expect(service.client).toBe(mockClient);
  });
});
