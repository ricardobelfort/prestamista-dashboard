import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faUsers, 
  faMoneyBillWave, 
  faCreditCard, 
  faGem,
  faClipboardList,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  imports: [FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 mt-6">
      <div>
        <h1 class="text-4xl font-bold text-slate-900">Bem-vindo ao Painel</h1>
        <p class="text-slate-600 mt-2 text-lg">Gerencie seus empréstimos, clientes e rotas de cobrança</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-600">Total Clientes</p>
              <p class="text-3xl font-bold text-slate-900">0</p>
            </div>
            <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <fa-icon [icon]="faUsers" class="text-slate-600 text-xl"></fa-icon>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-emerald-600 font-medium">+0 este mês</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-600">Empréstimos Ativos</p>
              <p class="text-3xl font-bold text-slate-900">0</p>
            </div>
            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <fa-icon [icon]="faMoneyBillWave" class="text-emerald-600 text-xl"></fa-icon>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-emerald-600 font-medium">+0 este mês</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-600">Pagamentos Pendentes</p>
              <p class="text-3xl font-bold text-slate-900">0</p>
            </div>
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <fa-icon [icon]="faCreditCard" class="text-amber-600 text-xl"></fa-icon>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-amber-600 font-medium">Aguardando</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-600">Valor Total</p>
              <p class="text-3xl font-bold text-slate-900">R$ 0,00</p>
            </div>
            <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <fa-icon [icon]="faGem" class="text-indigo-600 text-xl"></fa-icon>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-indigo-600 font-medium">Em circulação</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
          <h3 class="text-xl font-bold text-slate-900 mb-6">Atividade Recente</h3>
          <div class="space-y-3">
            <div class="text-center py-12 text-slate-500">
              <fa-icon [icon]="faClipboardList" class="text-5xl block mb-4 text-slate-400"></fa-icon>
              <p class="text-lg font-medium">Nenhuma atividade recente</p>
              <p class="text-sm text-slate-400 mt-1">As atividades aparecerão aqui quando houver</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
          <h3 class="text-xl font-bold text-slate-900 mb-6">Próximos Vencimentos</h3>
          <div class="space-y-3">
            <div class="text-center py-12 text-slate-500">
              <fa-icon [icon]="faCalendarAlt" class="text-5xl block mb-4 text-slate-400"></fa-icon>
              <p class="text-lg font-medium">Nenhum vencimento próximo</p>
              <p class="text-sm text-slate-400 mt-1">Os vencimentos aparecerão aqui</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  // FontAwesome icons
  faUsers = faUsers;
  faMoneyBillWave = faMoneyBillWave;
  faCreditCard = faCreditCard;
  faGem = faGem;
  faClipboardList = faClipboardList;
  faCalendarAlt = faCalendarAlt;
}