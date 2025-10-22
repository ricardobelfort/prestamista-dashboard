import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  async signIn(email: string, password: string) {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
    this.router.navigate(['/auth/login']);
  }

  async getUser() {
    const { data } = await this.supabase.client.auth.getUser();
    return data?.user ?? null;
  }

  onAuthStateChange(callback: Function) {
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }
}