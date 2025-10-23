import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { Logger } from './logger.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  
  try {
    const user = await auth.getUser();
    
    if (!user) {
      toast.info('Você precisa fazer login para continuar.');
      router.navigate(['/auth/login']);
      return false;
    }
    
    // Verifica se o token ainda é válido (não expirado)
    const session = await auth.getSession();
    if (!session) {
      toast.warning('Sua sessão expirou. Faça login novamente.');
      await auth.signOut();
      router.navigate(['/auth/login']);
      return false;
    }
    
    return true;
  } catch (error) {
    Logger.error('Erro ao verificar autenticação:', error);
    toast.error('Erro ao verificar autenticação. Faça login novamente.');
    router.navigate(['/auth/login']);
    return false;
  }
};