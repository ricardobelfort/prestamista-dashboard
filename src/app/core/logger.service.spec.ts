import { Logger } from './logger.service';

// Mock console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
};

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log', () => {
    it('should call console.log with arguments', () => {
      Logger.log('test message', 123, { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalledWith('test message', 123, { key: 'value' });
    });

    it('should handle multiple arguments', () => {
      Logger.log('arg1', 'arg2', 'arg3');
      expect(consoleLogSpy).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('warn', () => {
    it('should call console.warn with arguments', () => {
      Logger.warn('warning message', { details: 'test' });
      expect(consoleWarnSpy).toHaveBeenCalledWith('warning message', { details: 'test' });
    });
  });

  describe('error', () => {
    it('should call console.error with arguments', () => {
      Logger.error('error message', new Error('test error'));
      expect(consoleErrorSpy).toHaveBeenCalledWith('error message', new Error('test error'));
    });

    it('should handle error objects', () => {
      const error = new Error('Test error');
      Logger.error(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('info', () => {
    it('should call console.info with arguments', () => {
      Logger.info('info message', { data: 'value' });
      expect(consoleInfoSpy).toHaveBeenCalledWith('info message', { data: 'value' });
    });
  });

  describe('debug', () => {
    it('should call console.debug with arguments', () => {
      Logger.debug('debug message', { debug: 'data' });
      expect(consoleDebugSpy).toHaveBeenCalledWith('debug message', { debug: 'data' });
    });
  });

  describe('security', () => {
    it('should call console.warn with security prefix and details', () => {
      Logger.security('Unauthorized access attempt', { userId: '123', ip: '192.168.1.1' });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[SECURITY] Unauthorized access attempt',
        { userId: '123', ip: '192.168.1.1' }
      );
    });

    it('should work without details', () => {
      Logger.security('Security event');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[SECURITY] Security event', undefined);
    });

    it('should handle complex security details', () => {
      const details = {
        userId: 'user123',
        action: 'delete',
        resource: 'client',
        timestamp: new Date().toISOString(),
      };
      Logger.security('Suspicious activity', details);
      expect(consoleWarnSpy).toHaveBeenCalledWith('[SECURITY] Suspicious activity', details);
    });
  });
});
