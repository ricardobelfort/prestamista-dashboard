import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <form (ngSubmit)="onSubmit()" [formGroup]="form"
            class="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-linear-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-white font-bold text-2xl">P</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Bem-vindo</h1>
          <p class="text-slate-600 mt-1">Entre na sua conta</p>
        </div>
        
        <div class="space-y-4">
          <input formControlName="email" type="email" placeholder="E-mail"
                 class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors" />
          <input formControlName="password" type="password" placeholder="Senha"
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
              Entrando...
            </span>
          } @else {
            Entrar
          }
        </button>
      </form>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  async onSubmit() {
    if (this.form.invalid) return;
    
    this.loading.set(true);
    const { email, password } = this.form.value;
    
    try {
      await this.auth.signIn(email!, password!);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      alert(err.message);
    } finally {
      this.loading.set(false);
    }
  }
}