import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Empréstimos</h1>
        <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Novo Empréstimo
        </button>
      </div>
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Valor</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Taxa</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr>
              <td class="px-4 py-3 text-sm text-gray-500" colspan="5">
                Nenhum empréstimo registrado
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class LoansComponent { }