import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SidebarService } from '../../core/sidebar.service';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { Logger } from '../../core/logger.service';
import { LucideAngularModule, Home, Users, Wallet, CreditCard, MapPin, LogOut, ChevronLeft, ChevronRight, Settings } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, LucideAngularModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside [class]="'fixed top-0 left-0 transition-all duration-300 bg-neutral-900 h-screen shadow-xl flex flex-col z-50 ' + (sidebarService.expanded() ? 'w-64' : 'w-16')">
      <!-- Header com Logo e Botão Hambúrguer -->
      <div [class]="'flex items-center h-16 border-b border-neutral-800 ' + (sidebarService.expanded() ? 'justify-between px-4' : 'justify-center px-2')">
        @if (sidebarService.expanded()) {
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
              <span class="text-white font-bold text-sm">P</span>
            </div>
            <span class="text-xl font-bold text-white">Prestamista</span>
          </div>
        }
        
        <button 
          (click)="sidebarService.toggle()"
          [class]="'flex items-center justify-center hover:bg-neutral-800 rounded transition-colors duration-200 shrink-0 ' + (sidebarService.expanded() ? 'w-9 h-9' : 'w-12 h-12')"
          [title]="(sidebarService.expanded() ? ('nav.collapseMenu' | translate) : ('nav.expandMenu' | translate))"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 px-2 py-4">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" 
             routerLinkActive="bg-neutral-700 text-white" 
             [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
             [class]="'flex items-center mb-1 cursor-pointer rounded transition-all duration-150 group hover:bg-neutral-800 ' + (sidebarService.expanded() ? 'px-3 py-2.5' : 'w-12 h-12 justify-center')"
             [title]="!sidebarService.expanded() ? (item.label | translate) : ''">
            <lucide-icon [img]="item.icon" class="w-5 h-5 text-neutral-400 group-hover:text-neutral-200 transition-colors"></lucide-icon>
            @if (sidebarService.expanded()) {
              <span class="ml-3 text-neutral-300 text-sm font-medium group-hover:text-neutral-100 transition-colors">{{ item.label | translate }}</span>
            }
          </a>
        }
        
        <!-- Menu Admin (apenas para owners/admins) -->
        @if (isAdmin()) {
          <div class="mt-2 pt-2 border-t border-neutral-800">
            <a [routerLink]="'/dashboard/admin'" 
               routerLinkActive="bg-neutral-700 text-white"
               [class]="'flex items-center mb-1 cursor-pointer rounded transition-all duration-150 group hover:bg-neutral-800 ' + (sidebarService.expanded() ? 'px-3 py-2.5' : 'w-12 h-12 justify-center')"
               [title]="!sidebarService.expanded() ? ('nav.admin' | translate) : ''">
              <lucide-icon [img]="Settings" class="w-5 h-5 text-neutral-400 group-hover:text-neutral-200 transition-colors"></lucide-icon>
              @if (sidebarService.expanded()) {
                <span class="ml-3 text-neutral-300 text-sm font-medium group-hover:text-neutral-100 transition-colors">{{ 'nav.admin' | translate }}</span>
              }
            </a>
          </div>
        }
      </nav>

      <div [class]="'h-16 border-t border-neutral-800 flex items-center ' + (sidebarService.expanded() ? 'px-3' : 'px-2')">
        <button (click)="logout()" 
                [class]="'flex items-center text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-all duration-200 ' + (sidebarService.expanded() ? 'w-full px-3 py-2.5' : 'w-12 h-12 justify-center')"
                [title]="!sidebarService.expanded() ? ('nav.logout' | translate) : ''">
          <lucide-icon [img]="LogOut" class="w-5 h-5"></lucide-icon>
          @if (sidebarService.expanded()) {
            <span class="ml-3 text-sm font-medium">{{ 'nav.logout' | translate }}</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    lucide-icon {
      display: flex !important;
      align-items: center;
      justify-content: center;
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

  // Lucide icons
  readonly Home = Home;
  readonly Users = Users;
  readonly Wallet = Wallet;
  readonly CreditCard = CreditCard;
  readonly MapPin = MapPin;
  readonly LogOut = LogOut;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Settings = Settings;

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
      icon: Home, 
      label: 'nav.home', 
      route: '/dashboard' 
    },
    { 
      icon: Users, 
      label: 'nav.clients', 
      route: '/dashboard/clients' 
    },
    { 
      icon: Wallet, 
      label: 'nav.loans', 
      route: '/dashboard/loans' 
    },
    { 
      icon: CreditCard, 
      label: 'nav.payments', 
      route: '/dashboard/payments' 
    },
    { 
      icon: MapPin, 
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