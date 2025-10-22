import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form (ngSubmit)="onSubmit()" [formGroup]="form"
            class="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 class="text-xl font-semibold mb-4">Entrar</h1>
        <input formControlName="email" type="email" placeholder="E-mail"
               class="w-full p-2 mb-3 border rounded-lg focus:ring focus:ring-blue-300" />
        <input formControlName="password" type="password" placeholder="Senha"
               class="w-full p-2 mb-4 border rounded-lg focus:ring focus:ring-blue-300" />
        <button type="submit" [disabled]="loading()"
                class="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
          @if (loading()) {
            Entrando...
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