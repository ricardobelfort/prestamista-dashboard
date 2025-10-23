import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { Logger } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  async canActivate(): Promise<boolean> {
    try {
      // Verificação dupla: usuário autenticado E com role adequado
      const user = await this.authService.getUser();
      
      if (!user) {
        this.toastService.error('Você precisa estar autenticado para acessar esta área.');
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      const userRole = await this.dataService.getCurrentUserRole();
      
      // Apenas owners e admins podem acessar funcionalidades administrativas
      if (userRole === 'owner' || userRole === 'admin') {
        return true;
      }
      
      // Log de tentativa de acesso não autorizado (para auditoria)
      Logger.security(`Tentativa de acesso administrativo negada`, { userId: user.id, role: userRole });
      
      // Redirecionar para dashboard se não for admin
      this.toastService.error('Acesso negado. Você precisa ser administrador para acessar esta área.');
      this.router.navigate(['/dashboard']);
      return false;
      
    } catch (error) {
      Logger.error('Erro ao verificar permissões:', error);
      this.toastService.error('Erro ao verificar permissões. Tente novamente.');
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}