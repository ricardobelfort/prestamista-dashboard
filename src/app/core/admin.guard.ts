import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DataService } from './data.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private dataService = inject(DataService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  async canActivate(): Promise<boolean> {
    try {
      const userRole = await this.dataService.getCurrentUserRole();
      
      // Apenas owners e admins podem acessar funcionalidades administrativas
      if (userRole === 'owner' || userRole === 'admin') {
        return true;
      }
      
      // Redirecionar para dashboard se não for admin
      this.toastService.error('Acesso negado. Você precisa ser administrador para acessar esta área.');
      this.router.navigate(['/dashboard']);
      return false;
      
    } catch (error) {
      this.toastService.error('Erro ao verificar permissões. Tente novamente.');
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}