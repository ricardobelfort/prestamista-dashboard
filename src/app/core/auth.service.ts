import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  
  // Cache para evitar múltiplas chamadas à API
  private userCache: any = null;
  private userCacheTimestamp = 0;
  private readonly CACHE_DURATION = 30000; // 30 segundos

  async signIn(email: string, password: string) {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Limpar cache após login
    this.clearUserCache();
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
    this.clearUserCache();
    this.router.navigate(['/auth/login']);
  }

  async getUser() {
    // Verificar se o cache é válido
    const now = Date.now();
    if (this.userCache && (now - this.userCacheTimestamp) < this.CACHE_DURATION) {
      return this.userCache;
    }

    // Buscar do servidor
    const { data } = await this.supabase.client.auth.getUser();
    const user = data?.user ?? null;
    
    // Atualizar cache
    this.userCache = user;
    this.userCacheTimestamp = now;
    
    return user;
  }

  private clearUserCache() {
    this.userCache = null;
    this.userCacheTimestamp = 0;
  }

  onAuthStateChange(callback: Function) {
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      // Atualizar cache quando a sessão muda
      this.userCache = session?.user ?? null;
      this.userCacheTimestamp = Date.now();
      callback(session?.user ?? null);
    });
  }
}