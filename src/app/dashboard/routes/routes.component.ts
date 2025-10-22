import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-routes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Rotas de Cobrança</h1>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          Nova Rota
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-2">Nenhuma rota criada</h3>
          <p class="text-gray-600">Crie sua primeira rota de cobrança para organizar suas coletas.</p>
        </div>
      </div>
    </div>
  `
})
export class RoutesComponent { }