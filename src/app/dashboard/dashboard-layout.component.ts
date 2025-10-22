import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>
      <div class="flex">
        <app-sidebar></app-sidebar>
        <main class="flex-1">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent { }