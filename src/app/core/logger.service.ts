import { isDevMode } from '@angular/core';

/**
 * Logger service para controlar logs em produção
 * Em produção, os logs são suprimidos para evitar vazamento de informações
 */
export class Logger {
  static log(...args: any[]) {
    if (isDevMode()) {
      console.log(...args);
    }
  }

  static warn(...args: any[]) {
    if (isDevMode()) {
      console.warn(...args);
    }
  }

  static error(...args: any[]) {
    if (isDevMode()) {
      console.error(...args);
    } else {
      // Em produção, registra apenas mensagem genérica
      console.error('Ocorreu um erro. Entre em contato com o suporte.');
    }
  }

  static info(...args: any[]) {
    if (isDevMode()) {
      console.info(...args);
    }
  }

  static debug(...args: any[]) {
    if (isDevMode()) {
      console.debug(...args);
    }
  }

  /**
   * Logs de segurança sempre são registrados, mas sem detalhes sensíveis em produção
   */
  static security(message: string, details?: any) {
    if (isDevMode()) {
      console.warn(`[SECURITY] ${message}`, details);
    } else {
      // Em produção, registra apenas a mensagem sem detalhes
      console.warn(`[SECURITY] ${message}`);
    }
  }
}
