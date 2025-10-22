import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faUsers } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-clients',
  imports: [FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 mt-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold text-slate-900">Clientes</h1>
          <p class="text-slate-600 mt-2 text-lg">Gerencie sua base de clientes</p>
        </div>
        <button class="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors font-semibold shadow-lg flex items-center space-x-2 ring-1 ring-slate-200">
          <fa-icon [icon]="faPlus" class="w-4 h-4"></fa-icon>
          <span>Novo Cliente</span>
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 class="text-xl font-bold text-slate-900">Lista de Clientes</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">Nome</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">CPF</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">Telefone</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">Endereço</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr>
                <td class="px-6 py-12 text-center text-slate-500" colspan="5">
                  <div class="flex flex-col items-center">
                    <fa-icon [icon]="faUsers" class="text-5xl mb-4 text-slate-400"></fa-icon>
                    <p class="text-xl font-semibold">Nenhum cliente cadastrado</p>
                    <p class="text-sm text-slate-400 mt-2">Comece adicionando seu primeiro cliente</p>
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
export class ClientsComponent {
  // FontAwesome icons
  faPlus = faPlus;
  faUsers = faUsers;
}