import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { SidebarService } from '../core/sidebar.service';
import { VersionService } from '../core/version.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-sidebar></app-sidebar>
      <app-navbar></app-navbar>
      <main class="pb-20 p-6 transition-all duration-300 min-h-screen" [class.ml-64]="sidebarService.expanded()" [class.ml-20]="!sidebarService.expanded()">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Rodapé Fixo -->
      <footer class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 transition-all duration-300 z-10" [class.pl-64]="sidebarService.expanded()" [class.pl-20]="!sidebarService.expanded()">
        <div class="h-full px-6 flex flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-3">
            <p class="text-sm text-slate-600">
              © {{ currentYear }} Prestamista. {{ 'footer.copyright' | translate }}
            </p>
            <span class="text-slate-300">|</span>
            <p class="text-xs text-slate-500">
              {{ versionService.getVersionFormatted() }}
            </p>
          </div>
          
          <div class="flex space-x-6 text-sm">
            <a href="#" class="text-slate-500 hover:text-slate-700 transition-colors">
              {{ 'footer.privacy' | translate }}
            </a>
            <a href="#" class="text-slate-500 hover:text-slate-700 transition-colors">
              {{ 'footer.terms' | translate }}
            </a>
            <a href="#" class="text-slate-500 hover:text-slate-700 transition-colors">
              {{ 'footer.support' | translate }}
            </a>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class DashboardLayoutComponent {
  sidebarService = inject(SidebarService);
  protected versionService = inject(VersionService);
  currentYear = new Date().getFullYear();
}