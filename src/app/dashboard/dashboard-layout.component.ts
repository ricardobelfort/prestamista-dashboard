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
      <main class="pt-16 p-6 transition-all duration-300" [class.ml-64]="sidebarService.expanded()" [class.ml-20]="!sidebarService.expanded()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class DashboardLayoutComponent {
  sidebarService = inject(SidebarService);
}