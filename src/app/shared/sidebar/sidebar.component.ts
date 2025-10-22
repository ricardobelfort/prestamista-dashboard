import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SidebarService } from '../../core/sidebar.service';
import { VersionService } from '../../core/version.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faHome, 
  faUsers, 
  faMoneyBillWave, 
  faCreditCard, 
  faRoute, 
  faSignOutAlt,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside [class]="'fixed top-0 left-0 transition-all duration-300 bg-slate-900 h-screen shadow-xl flex flex-col z-30 ' + (sidebarService.expanded() ? 'w-64' : 'w-20')">
      <div class="flex items-center justify-between px-4 py-4 border-b border-slate-700">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 bg-linear-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-base">P</span>
          </div>
          @if (sidebarService.expanded()) {
            <span class="text-xl font-bold text-slate-100">Prestamista</span>
          }
        </div>
        <button (click)="toggleSidebar()" class="text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-slate-800">
          @if (sidebarService.expanded()) {
            <fa-icon [icon]="faChevronLeft" class="w-4 h-4"></fa-icon>
          } @else {
            <fa-icon [icon]="faChevronRight" class="w-4 h-4"></fa-icon>
          }
        </button>
      </div>

      <nav class="flex-1 px-3 py-6">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" 
             routerLinkActive="bg-slate-700 text-slate-100 shadow-lg" 
             [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
             class="flex items-center p-3 mb-2 cursor-pointer rounded-xl hover:bg-slate-800 transition-all duration-200 group"
             [title]="!sidebarService.expanded() ? item.label : ''">
            <fa-icon [icon]="item.icon" class="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors"></fa-icon>
            @if (sidebarService.expanded()) {
              <span class="ml-3 text-slate-300 text-sm font-medium group-hover:text-slate-100 transition-colors">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <div class="p-3 border-t border-slate-700">
        <button (click)="logout()" 
                class="flex items-center w-full p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all duration-200"
                [title]="!sidebarService.expanded() ? 'Sair' : ''">
          <fa-icon [icon]="faSignOutAlt" class="w-5 h-5"></fa-icon>
          @if (sidebarService.expanded()) {
            <span class="ml-3 text-sm font-medium">Sair</span>
          }
        </button>
        
        <!-- Versão do Sistema -->
        @if (sidebarService.expanded()) {
          <div class="mt-3 px-3 py-2 text-center">
            <p class="text-xs text-slate-500">{{ versionService.getVersionFormatted() }}</p>
          </div>
        }
      </div>
    </aside>
  `
})
export class SidebarComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  sidebarService = inject(SidebarService);
  protected versionService = inject(VersionService);

  // FontAwesome icons
  faHome = faHome;
  faUsers = faUsers;
  faMoneyBillWave = faMoneyBillWave;
  faCreditCard = faCreditCard;
  faRoute = faRoute;
  faSignOutAlt = faSignOutAlt;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  navItems = [
    { 
      icon: this.faHome, 
      label: 'Início', 
      route: '/dashboard' 
    },
    { 
      icon: this.faUsers, 
      label: 'Clientes', 
      route: '/dashboard/clients' 
    },
    { 
      icon: this.faMoneyBillWave, 
      label: 'Empréstimos', 
      route: '/dashboard/loans' 
    },
    { 
      icon: this.faCreditCard, 
      label: 'Pagamentos', 
      route: '/dashboard/payments' 
    },
    { 
      icon: this.faRoute, 
      label: 'Rotas', 
      route: '/dashboard/routes' 
    }
  ];

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  async logout() {
    await this.auth.signOut();
  }
}