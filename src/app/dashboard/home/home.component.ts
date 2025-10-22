import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Dashboard - Home</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-700">Total Clientes</h3>
          <p class="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-700">Empréstimos Ativos</h3>
          <p class="text-2xl font-bold text-green-600">0</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-700">Pagamentos Pendentes</h3>
          <p class="text-2xl font-bold text-orange-600">0</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-700">Valor Total</h3>
          <p class="text-2xl font-bold text-purple-600">R$ 0,00</p>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent { }