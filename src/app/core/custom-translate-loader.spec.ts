import { TestBed } from '@angular/core/testing';
import { CustomTranslateLoader } from './custom-translate-loader';

// Mock global fetch
global.fetch = jest.fn();

describe('CustomTranslateLoader', () => {
  let loader: CustomTranslateLoader;

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();

    TestBed.configureTestingModule({
      providers: [CustomTranslateLoader],
    });

    loader = TestBed.inject(CustomTranslateLoader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(loader).toBeTruthy();
  });

  it('should load translations from JSON file', (done) => {
    const mockTranslations = {
      'HELLO': 'Olá',
      'GOODBYE': 'Tchau',
      'WELCOME': 'Bem-vindo',
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockTranslations,
    });

    loader.getTranslation('pt-BR').subscribe((translations) => {
      expect(translations).toEqual(mockTranslations);
      expect(global.fetch).toHaveBeenCalledWith('/assets/i18n/pt-BR.json');
      done();
    });
  });

  it('should load English translations', (done) => {
    const mockTranslations = {
      'HELLO': 'Hello',
      'GOODBYE': 'Goodbye',
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockTranslations,
    });

    loader.getTranslation('en-US').subscribe((translations) => {
      expect(translations).toEqual(mockTranslations);
      expect(global.fetch).toHaveBeenCalledWith('/assets/i18n/en-US.json');
      done();
    });
  });

  it('should load Spanish translations', (done) => {
    const mockTranslations = {
      'HELLO': 'Hola',
      'GOODBYE': 'Adiós',
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockTranslations,
    });

    loader.getTranslation('es-PY').subscribe((translations) => {
      expect(translations).toEqual(mockTranslations);
      expect(global.fetch).toHaveBeenCalledWith('/assets/i18n/es-PY.json');
      done();
    });
  });

  it('should return empty object on HTTP error', (done) => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    loader.getTranslation('pt-BR').subscribe((translations) => {
      expect(translations).toEqual({});
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao carregar traduções para pt-BR:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
      done();
    });
  });

  it('should return empty object on network error', (done) => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    loader.getTranslation('en-US').subscribe((translations) => {
      expect(translations).toEqual({});
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao carregar traduções para en-US:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
      done();
    });
  });

  it('should return empty object on JSON parse error', (done) => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    loader.getTranslation('pt-BR').subscribe((translations) => {
      expect(translations).toEqual({});
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
      done();
    });
  });

  it('should handle empty translations file', (done) => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    loader.getTranslation('pt-BR').subscribe((translations) => {
      expect(translations).toEqual({});
      done();
    });
  });
});
