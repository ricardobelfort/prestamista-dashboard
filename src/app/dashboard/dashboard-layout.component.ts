import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { SidebarService } from '../core/sidebar.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-sidebar></app-sidebar>
      <app-navbar></app-navbar>
      <main class="pt-16 pb-20 p-6 transition-all duration-300 min-h-screen" [class.ml-64]="sidebarService.expanded()" [class.ml-20]="!sidebarService.expanded()">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Rodapé Fixo -->
      <footer class="fixed bottom-0 right-0 h-16 transition-all duration-300 z-10" [class.left-64]="sidebarService.expanded()" [class.left-20]="!sidebarService.expanded()">
        <div class="h-full px-6 flex flex-col md:flex-row justify-between items-center">
          <div class="text-center md:text-left">
            <p class="text-sm text-slate-600">
              © {{ currentYear }} Prestamista. Todos os direitos reservados.
            </p>
          </div>
          
          <div class="flex space-x-6 text-sm">
            <a href="#" class="text-slate-500 hover:text-slate-700 transition-colors">
              Política de Privacidade
            </a>
            <a href="#" class="text-slate-500 hover:text-slate-700 transition-colors">
              Termos de Uso
            </a>
            <a href="#" class="text-slate-500 hover:text-slate-700 transition-colors">
              Suporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class DashboardLayoutComponent {
  sidebarService = inject(SidebarService);
  currentYear = new Date().getFullYear();
}