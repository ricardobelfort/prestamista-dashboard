import { Injectable } from '@angular/core';

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RateLimiterService {
  private attempts = new Map<string, RateLimitEntry>();
  
  // Configurações padrão
  private readonly MAX_ATTEMPTS = 5; // Máximo de tentativas
  private readonly WINDOW_MS = 15 * 60 * 1000; // Janela de 15 minutos
  private readonly BLOCK_DURATION_MS = 30 * 60 * 1000; // Bloqueio de 30 minutos

  /**
   * Verifica se uma ação está sendo limitada (rate limited)
   * @param key Identificador único da ação (ex: 'login:user@example.com')
   * @returns true se a ação está bloqueada, false caso contrário
   */
  isRateLimited(key: string): boolean {
    const entry = this.attempts.get(key);
    
    if (!entry) return false;
    
    const now = Date.now();
    
    // Verifica se está no período de bloqueio
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return true;
    }
    
    // Se passou o período de bloqueio, limpa
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      this.attempts.delete(key);
      return false;
    }
    
    // Verifica se passou a janela de tempo
    if (now - entry.firstAttempt > this.WINDOW_MS) {
      this.attempts.delete(key);
      return false;
    }
    
    return false;
  }

  /**
   * Registra uma tentativa de ação
   * @param key Identificador único da ação
   * @returns true se ainda pode tentar, false se atingiu o limite
   */
  attempt(key: string): boolean {
    if (this.isRateLimited(key)) {
      return false;
    }
    
    const now = Date.now();
    const entry = this.attempts.get(key);
    
    if (!entry) {
      // Primeira tentativa
      this.attempts.set(key, {
        attempts: 1,
        firstAttempt: now
      });
      return true;
    }
    
    // Incrementa tentativas
    entry.attempts++;
    
    // Se atingiu o limite, bloqueia
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      entry.blockedUntil = now + this.BLOCK_DURATION_MS;
      return false;
    }
    
    return true;
  }

  /**
   * Reseta as tentativas para uma chave (usar após login bem-sucedido)
   * @param key Identificador único da ação
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Retorna o tempo restante de bloqueio em minutos
   * @param key Identificador único da ação
   * @returns Minutos restantes de bloqueio, ou 0 se não estiver bloqueado
   */
  getBlockedTimeRemaining(key: string): number {
    const entry = this.attempts.get(key);
    
    if (!entry || !entry.blockedUntil) return 0;
    
    const now = Date.now();
    const remaining = entry.blockedUntil - now;
    
    if (remaining <= 0) return 0;
    
    return Math.ceil(remaining / (60 * 1000)); // Converte para minutos
  }

  /**
   * Retorna o número de tentativas restantes
   * @param key Identificador único da ação
   * @returns Número de tentativas restantes
   */
  getRemainingAttempts(key: string): number {
    const entry = this.attempts.get(key);
    
    if (!entry) return this.MAX_ATTEMPTS;
    
    return Math.max(0, this.MAX_ATTEMPTS - entry.attempts);
  }
}
