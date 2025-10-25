import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { VersionService } from '../../core/version.service';
import { RateLimiterService } from '../../core/rate-limiter.service';
import { ToastService } from '../../core/toast.service';
import { LanguageService } from '../../core/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <form (ngSubmit)="onSubmit()" [formGroup]="form"
            class="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-linear-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-white font-bold text-2xl">P</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">{{ 'login.welcome' | translate }}</h1>
          <p class="text-slate-600 mt-1">{{ 'login.subtitle' | translate }}</p>
        </div>
        
        <div class="space-y-4">
          <input formControlName="email" type="email" [placeholder]="'login.email' | translate"
                 class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors" />
          <input formControlName="password" type="password" [placeholder]="'login.password' | translate"
                 class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors" />
        </div>
        
        <button type="submit" [disabled]="loading()"
                class="w-full bg-slate-800 text-white p-3 rounded-xl hover:bg-slate-700 disabled:bg-slate-400 transition-colors font-semibold mt-6 shadow-lg">
          @if (loading()) {
            <span class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ 'login.loggingIn' | translate }}
            </span>
          } @else {
            {{ 'login.loginButton' | translate }}
          }
        </button>
        
        <!-- Versão do Sistema -->
        <div class="text-center mt-6 pt-4 border-t border-slate-200">
          <p class="text-xs text-slate-500">{{ versionService.getVersionFormatted() }}</p>
        </div>
      </form>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private rateLimiter = inject(RateLimiterService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);
  protected versionService = inject(VersionService);

  loading = signal(false);
  
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor() {
    // O LanguageService já inicializa as traduções automaticamente
    
    // Garantir que a versão seja carregada
    this.versionService.waitForLoad();
  }

  async onSubmit() {
    if (this.form.invalid) return;
    
    const { email, password } = this.form.value;
    const rateLimitKey = `login:${email}`;
    
    // Verifica se está bloqueado por rate limiting
    if (this.rateLimiter.isRateLimited(rateLimitKey)) {
      const minutesRemaining = this.rateLimiter.getBlockedTimeRemaining(rateLimitKey);
      this.toast.error(
        this.translate.instant('login.tooManyAttempts', { minutes: minutesRemaining })
      );
      return;
    }
    
    // Verifica se pode tentar
    if (!this.rateLimiter.attempt(rateLimitKey)) {
      const minutesRemaining = this.rateLimiter.getBlockedTimeRemaining(rateLimitKey);
      this.toast.error(
        this.translate.instant('login.accountBlocked', { minutes: minutesRemaining })
      );
      return;
    }
    
    this.loading.set(true);
    
    try {
      await this.auth.signIn(email!, password!);
      // Login bem-sucedido - reseta o rate limiter
      this.rateLimiter.reset(rateLimitKey);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      // Mostra mensagem de erro mas não revela se o usuário existe ou não (segurança)
      this.toast.error(this.translate.instant('login.invalidCredentials'));
      
      const attemptsRemaining = this.rateLimiter.getRemainingAttempts(rateLimitKey);
      if (attemptsRemaining > 0 && attemptsRemaining <= 2) {
        this.toast.warning(
          this.translate.instant('login.attemptsRemaining', { attempts: attemptsRemaining })
        );
      }
    } finally {
      this.loading.set(false);
    }
  }
}