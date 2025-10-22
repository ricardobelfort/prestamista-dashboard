import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-payments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Pagamentos</h1>
        <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Registrar Pagamento
        </button>
      </div>
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Empréstimo</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Valor</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Data</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr>
              <td class="px-4 py-3 text-sm text-gray-500" colspan="5">
                Nenhum pagamento registrado
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PaymentsComponent { }