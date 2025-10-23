import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { AuthCallbackComponent } from './auth/callback/callback.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.routes)
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];
