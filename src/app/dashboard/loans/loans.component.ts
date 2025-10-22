import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faDollarSign } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-loans',
  imports: [FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 mt-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold text-slate-900">Empréstimos</h1>
          <p class="text-slate-600 mt-2 text-lg">Gerencie seus empréstimos e financiamentos</p>
        </div>
        <button class="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors font-semibold shadow-lg flex items-center space-x-2 ring-1 ring-slate-200">
          <fa-icon [icon]="faPlus" class="w-4 h-4"></fa-icon>
          <span>Novo Empréstimo</span>
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 class="text-xl font-bold text-slate-900">Lista de Empréstimos</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">Cliente</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">Valor</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">Taxa</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr>
                <td class="px-6 py-12 text-center text-slate-500" colspan="5">
                  <div class="flex flex-col items-center">
                    <fa-icon [icon]="faDollarSign" class="text-5xl mb-4 text-slate-400"></fa-icon>
                    <p class="text-xl font-semibold">Nenhum empréstimo registrado</p>
                    <p class="text-sm text-slate-400 mt-2">Comece criando seu primeiro empréstimo</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LoansComponent {
  // FontAwesome icons
  faPlus = faPlus;
  faDollarSign = faDollarSign;
}