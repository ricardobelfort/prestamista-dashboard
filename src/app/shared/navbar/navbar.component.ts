import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DataService } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { SidebarService } from '../../core/sidebar.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fixed top-0 right-0 h-16 bg-white/95 flex items-center justify-end px-6 z-10 border-b border-slate-200 transition-all duration-300" [class.left-64]="sidebarService.expanded()" [class.left-20]="!sidebarService.expanded()">
      <div class="flex items-center space-x-4">
        <div class="text-right">
          <div class="text-sm font-semibold text-slate-800">{{ userName() }}</div>
          <div class="text-xs text-slate-500">{{ userRoleLabel() }}</div>
        </div>
        <div class="w-10 h-10 rounded-full bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg ring-2 ring-slate-200">
          <span class="text-white font-bold text-sm">{{ getInitials() }}</span>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit {
  private data = inject(DataService);
  private auth = inject(AuthService);
  sidebarService = inject(SidebarService);

  userName = signal('Carregando...');
  userRole = signal<string | null>(null);

  async ngOnInit() {
    try {
      const profile = await this.data.getProfile();
      this.userName.set(profile?.full_name ?? 'Usuário');
      
      const role = await this.data.getCurrentUserRole();
      this.userRole.set(role);
    } catch {
      this.userName.set('Usuário');
      this.userRole.set(null);
    }
  }

  getInitials(): string {
    const name = this.userName();
    if (name === 'Carregando...') return '...';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  }

  userRoleLabel(): string {
    const role = this.userRole();
    if (!role) return 'Carregando...';
    
    const roleLabels: Record<string, string> = {
      'owner': 'Proprietário',
      'admin': 'Administrador',
      'collector': 'Cobrador',
      'viewer': 'Visualizador'
    };
    
    return roleLabels[role] || 'Usuário';
  }
}