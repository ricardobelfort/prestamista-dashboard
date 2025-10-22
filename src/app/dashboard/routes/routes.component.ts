import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faRoute } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-routes',
  imports: [FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 mt-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Rotas de Cobrança</h1>
          <p class="text-slate-600 mt-2 text-lg">Organize suas rotas de cobrança por região</p>
        </div>
        <button class="bg-slate-800 text-white px-6 py-3 rounded-md hover:bg-slate-700 transition-colors font-semibold shadow-lg flex items-center space-x-2 ring-1 ring-slate-200">
          <fa-icon [icon]="faPlus" class="w-4 h-4"></fa-icon>
          <span>Nova Rota</span>
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 class="text-xl font-bold text-slate-900">Suas Rotas</h3>
        </div>
        <div class="p-6">
          <div class="flex flex-col items-center py-16">
            <fa-icon [icon]="faRoute" class="text-5xl mb-4 text-slate-400"></fa-icon>
            <p class="text-xl font-semibold text-slate-900">Nenhuma rota criada</p>
            <p class="text-sm text-slate-400 mt-2 text-center max-w-md">
              Crie sua primeira rota de cobrança para organizar suas coletas por região e otimizar seu tempo
            </p>
            <button class="mt-6 bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors font-semibold shadow-lg flex items-center space-x-2">
              <fa-icon [icon]="faPlus" class="w-4 h-4"></fa-icon>
              <span>Criar Primeira Rota</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoutesComponent {
  // FontAwesome icons
  faPlus = faPlus;
  faRoute = faRoute;
}