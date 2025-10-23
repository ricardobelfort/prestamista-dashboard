import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { LanguageService, Language } from '../../core/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FontAwesomeModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-end sticky top-0 z-40">
      <div class="flex items-center gap-6">
        <!-- Language Selector -->
        <div class="relative">
          <button 
            (click)="toggleLanguageDropdown()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200"
            [class.bg-slate-50]="showLanguageDropdown()"
          >
            <span class="text-xl">{{ languageService.currentLanguage().flag }}</span>
            <span class="text-slate-700 font-semibold text-sm uppercase">{{ languageService.currentLanguage().code.split('-')[0] }}</span>
          </button>

          <!-- Dropdown -->
          @if (showLanguageDropdown()) {
            <div class="absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 py-2 min-w-[140px] z-50 overflow-hidden">
              @for (lang of languageService.availableLanguages; track lang.code) {
                <button
                  (click)="selectLanguage(lang.code)"
                  class="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors duration-150"
                  [class.bg-slate-100]="lang.code === languageService.currentLanguage().code"
                >
                  <span class="text-xl">{{ lang.flag }}</span>
                  <span class="text-slate-700 font-semibold text-sm">{{ lang.name }}</span>
                </button>
              }
            </div>
          }
        </div>

        <!-- User Profile -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md ring-2 ring-slate-200">
            <span class="text-white font-bold text-xs">{{ getInitials() }}</span>
          </div>
          <div class="hidden sm:block">
            <div class="text-sm font-semibold text-slate-800">{{ userName() }}</div>
            <div class="text-xs text-slate-500">{{ userRoleLabel() | translate }}</div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .absolute.bg-white {
      animation: fadeIn 0.15s ease-out;
    }
    
    fa-icon {
      display: flex !important;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1 / 1;
    }
  `]
})
export class NavbarComponent implements OnInit {
  private data = inject(DataService);
  private auth = inject(AuthService);
  languageService = inject(LanguageService);

  userName = signal('Carregando...');
  userRole = signal<string | null>(null);
  showLanguageDropdown = signal(false);

  // Icons
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

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

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showLanguageDropdown.set(false);
      }
    });
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
    
    return 'roles.' + role;
  }

  toggleLanguageDropdown(): void {
    this.showLanguageDropdown.set(!this.showLanguageDropdown());
  }

  selectLanguage(langCode: string): void {
    this.languageService.setLanguage(langCode);
    this.showLanguageDropdown.set(false);
  }
}