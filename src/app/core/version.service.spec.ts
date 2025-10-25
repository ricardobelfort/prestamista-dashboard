import { TestBed } from '@angular/core/testing';
import { VersionService } from './version.service';

// Mock global fetch
global.fetch = jest.fn();

describe('VersionService', () => {
  let service: VersionService;

  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();

    TestBed.configureTestingModule({
      providers: [VersionService],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created with default version', () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    service = TestBed.inject(VersionService);
    
    expect(service).toBeTruthy();
    expect(service.getVersion()).toBe('1.0.0');
    expect(service.getVersionFormatted()).toBe('v1.0.0');
  });

  it('should load version info from version.json', async () => {
    const mockVersionData = {
      version: '1.5.2',
      formatted: 'v1.5.2',
      buildInfo: {
        baseVersion: '1.5.2',
        buildNumber: '42',
        gitCommit: 'abc123',
        gitBranch: 'main',
        environment: 'production',
        buildTime: '2024-01-01T00:00:00Z',
        isProduction: true,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockVersionData,
    });

    service = TestBed.inject(VersionService);
    await service.waitForLoad();

    expect(service.getVersion()).toBe('1.5.2');
    expect(service.getVersionFormatted()).toBe('v1.5.2');
    expect(service.getBuildInfo()).toEqual(mockVersionData.buildInfo);
    expect(service.isProduction()).toBe(true);
    expect(service.getCommitHash()).toBe('abc123');
    expect(service.getBranch()).toBe('main');
  });

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    service = TestBed.inject(VersionService);
    await service.waitForLoad();

    // Should use default values
    expect(service.getVersion()).toBe('1.0.0');
    expect(service.getVersionFormatted()).toBe('v1.0.0');
    expect(service.getBuildInfo()).toBeUndefined();
  });

  it('should handle non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    service = TestBed.inject(VersionService);
    await service.waitForLoad();

    expect(service.getVersion()).toBe('1.0.0');
    expect(service.getVersionFormatted()).toBe('v1.0.0');
  });

  it('should return false for isProduction when buildInfo is missing', async () => {
    const mockVersionData = {
      version: '1.0.0',
      formatted: 'v1.0.0',
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockVersionData,
    });

    service = TestBed.inject(VersionService);
    await service.waitForLoad();

    expect(service.isProduction()).toBe(false);
  });

  it('should return empty string for missing commit hash', async () => {
    const mockVersionData = {
      version: '1.0.0',
      formatted: 'v1.0.0',
      buildInfo: {
        baseVersion: '1.0.0',
        buildNumber: '1',
        gitCommit: '',
        gitBranch: 'develop',
        environment: 'development',
        buildTime: '2024-01-01T00:00:00Z',
        isProduction: false,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockVersionData,
    });

    service = TestBed.inject(VersionService);
    await service.waitForLoad();

    expect(service.getCommitHash()).toBe('');
  });

  it('should return empty string for missing branch', async () => {
    const mockVersionData = {
      version: '1.0.0',
      formatted: 'v1.0.0',
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockVersionData,
    });

    service = TestBed.inject(VersionService);
    await service.waitForLoad();

    expect(service.getBranch()).toBe('');
  });

  it('should force reload version info', async () => {
    const initialVersionData = {
      version: '1.0.0',
      formatted: 'v1.0.0',
    };

    const updatedVersionData = {
      version: '2.0.0',
      formatted: 'v2.0.0',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialVersionData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedVersionData,
      });

    service = TestBed.inject(VersionService);
    await service.waitForLoad();

    expect(service.getVersion()).toBe('1.0.0');

    await service.forceReload();

    expect(service.getVersion()).toBe('2.0.0');
    expect(service.getVersionFormatted()).toBe('v2.0.0');
  });

  it('should use cache busting in fetch URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.0.0', formatted: 'v1.0.0' }),
    });

    service = TestBed.inject(VersionService);
    await service.waitForLoad();

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toMatch(/\/version\.json\?v=\d+&r=[\d.]+/);
  });
});
