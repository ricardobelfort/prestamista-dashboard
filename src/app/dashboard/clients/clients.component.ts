import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-clients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Clientes</h1>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Novo Cliente
        </button>
      </div>
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">CPF</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Telefone</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr>
              <td class="px-4 py-3 text-sm text-gray-500" colspan="4">
                Nenhum cliente cadastrado
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ClientsComponent { }