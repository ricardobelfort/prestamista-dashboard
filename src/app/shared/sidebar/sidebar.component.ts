import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="w-64 bg-gray-800 min-h-screen">
      <nav class="mt-8">
        <div class="px-4">
          <ul class="space-y-2">
            <li>
              <a routerLink="/dashboard" 
                 routerLinkActive="bg-gray-700 text-white" 
                 [routerLinkActiveOptions]="{exact: true}"
                 class="flex items-center px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/clients" 
                 routerLinkActive="bg-gray-700 text-white"
                 class="flex items-center px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                <span>Clientes</span>
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/loans" 
                 routerLinkActive="bg-gray-700 text-white"
                 class="flex items-center px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                <span>Empréstimos</span>
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/payments" 
                 routerLinkActive="bg-gray-700 text-white"
                 class="flex items-center px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                <span>Pagamentos</span>
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/routes" 
                 routerLinkActive="bg-gray-700 text-white"
                 class="flex items-center px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                <span>Rotas</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  `
})
export class SidebarComponent { }