import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SidebarService } from '../../core/sidebar.service';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { Logger } from '../../core/logger.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { 
  faHome, 
  faUsers, 
  faMoneyBillWave, 
  faCreditCard, 
  faRoute, 
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faCog
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, FontAwesomeModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside [class]="'fixed top-0 left-0 transition-all duration-300 bg-slate-900 h-screen shadow-xl flex flex-col z-20 ' + (sidebarService.expanded() ? 'w-64' : 'w-16')">
      <div [class]="'flex items-center border-b border-slate-700 py-4 ' + (sidebarService.expanded() ? 'justify-between px-4' : 'justify-center px-3')">
        <div [class]="'flex items-center ' + (sidebarService.expanded() ? 'space-x-3' : '')">
          <div class="w-9 h-9 bg-linear-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-base">P</span>
          </div>
          @if (sidebarService.expanded()) {
            <span class="text-xl font-bold text-slate-100">Prestamista</span>
          }
        </div>
      </div>

      <nav class="flex-1 px-3 py-6">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" 
             routerLinkActive="bg-slate-700 text-slate-100 shadow-lg" 
             [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
             [class]="'flex items-center p-3 mb-2 cursor-pointer rounded-xl hover:bg-slate-800 transition-all duration-200 group ' + (!sidebarService.expanded() ? 'justify-center' : '')"
             [title]="!sidebarService.expanded() ? (item.label | translate) : ''">
            <fa-icon [icon]="item.icon" class="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors"></fa-icon>
            @if (sidebarService.expanded()) {
              <span class="ml-3 text-slate-300 text-sm font-medium group-hover:text-slate-100 transition-colors">{{ item.label | translate }}</span>
            }
          </a>
        }
        
        <!-- Menu Admin (apenas para owners/admins) -->
        @if (isAdmin()) {
          <div class="mt-4 pt-4 border-t border-slate-700">
            <a [routerLink]="'/dashboard/admin'" 
               routerLinkActive="bg-slate-700 text-slate-100 shadow-lg"
               [class]="'flex items-center p-3 mb-2 cursor-pointer rounded-xl hover:bg-slate-800 transition-all duration-200 group ' + (!sidebarService.expanded() ? 'justify-center' : '')"
               [title]="!sidebarService.expanded() ? ('nav.admin' | translate) : ''">
              <fa-icon [icon]="faCog" class="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors"></fa-icon>
              @if (sidebarService.expanded()) {
                <span class="ml-3 text-slate-300 text-sm font-medium group-hover:text-slate-100 transition-colors">{{ 'nav.admin' | translate }}</span>
              }
            </a>
          </div>
        }
      </nav>

      <div class="h-16 border-t border-slate-700 flex items-center px-3">
        <button (click)="logout()" 
                [class]="'flex items-center w-full p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all duration-200 ' + (!sidebarService.expanded() ? 'justify-center' : '')"
                [title]="!sidebarService.expanded() ? ('nav.logout' | translate) : ''">
          <fa-icon [icon]="faSignOutAlt" class="w-5 h-5"></fa-icon>
          @if (sidebarService.expanded()) {
            <span class="ml-3 text-sm font-medium">{{ 'nav.logout' | translate }}</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    fa-icon {
      display: flex !important;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1 / 1;
    }
  `]
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  sidebarService = inject(SidebarService);

  // State
  isAdmin = signal(false);

  // FontAwesome icons
  faHome = faHome;
  faUsers = faUsers;
  faMoneyBillWave = faMoneyBillWave;
  faCreditCard = faCreditCard;
  faRoute = faRoute;
  faSignOutAlt = faSignOutAlt;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faCog = faCog;

  async ngOnInit() {
    await this.checkUserRole();
  }

  async checkUserRole() {
    try {
      const role = await this.dataService.getCurrentUserRole();
      
      const isAdminRole = role === 'owner' || role === 'admin';
      
      this.isAdmin.set(isAdminRole);
    } catch (error) {
      // Log interno para debug, sem mostrar toast pois é uma verificação silenciosa
      Logger.error('Erro ao verificar role do usuário:', error);
      this.isAdmin.set(false);
    }
  }

  navItems = [
    { 
      icon: this.faHome, 
      label: 'nav.home', 
      route: '/dashboard' 
    },
    { 
      icon: this.faUsers, 
      label: 'nav.clients', 
      route: '/dashboard/clients' 
    },
    { 
      icon: this.faMoneyBillWave, 
      label: 'nav.loans', 
      route: '/dashboard/loans' 
    },
    { 
      icon: this.faCreditCard, 
      label: 'nav.payments', 
      route: '/dashboard/payments' 
    },
    { 
      icon: this.faRoute, 
      label: 'nav.routes', 
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