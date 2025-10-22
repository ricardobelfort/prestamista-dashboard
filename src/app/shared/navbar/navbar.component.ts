import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Prestamista Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button (click)="logout()" 
                    class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private auth = inject(AuthService);

  async logout() {
    await this.auth.signOut();
  }
}