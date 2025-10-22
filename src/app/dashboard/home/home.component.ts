import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CurrencyPipe } from '@angular/common';
import { 
  faUsers, 
  faMoneyBillWave, 
  faCreditCard, 
  faGem,
  faClipboardList,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-home',
  imports: [FontAwesomeModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 mt-6">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Bem-vindo ao Painel</h1>
        <p class="text-muted-foreground mt-2 text-lg">Gerencie seus empréstimos, clientes e rotas de cobrança</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-muted-foreground">Total Clientes</p>
              <p class="text-3xl font-bold text-foreground">{{ metrics().total_clients }}</p>
            </div>
            <div class="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <fa-icon [icon]="faUsers" class="text-muted-foreground text-xl"></fa-icon>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-emerald-600 font-medium">+0 este mês</span>
          </div>
        </div>

        <div class="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-muted-foreground">Empréstimos Ativos</p>
              <p class="text-3xl font-bold text-foreground">{{ metrics().total_loans }}</p>
            </div>
            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <fa-icon [icon]="faMoneyBillWave" class="text-emerald-600 text-xl"></fa-icon>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-emerald-600 font-medium">+0 este mês</span>
          </div>
        </div>

        <div class="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-muted-foreground">Pagamentos Pendentes</p>
              <p class="text-3xl font-bold text-foreground">{{ metrics().total_payments_pending }}</p>
            </div>
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <fa-icon [icon]="faCreditCard" class="text-amber-600 text-xl"></fa-icon>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-amber-600 font-medium">Aguardando</span>
          </div>
        </div>

        <div class="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-muted-foreground">Valor Total</p>
              <p class="text-3xl font-bold text-foreground">{{ (metrics().total_principal || 0) | currency:'BRL':'symbol':'1.2-2' }}</p>
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
        <div class="card p-6">
          <h3 class="text-xl font-bold text-foreground mb-6">Atividade Recente</h3>
          <div class="space-y-3">
            <div class="text-center py-12 text-muted-foreground">
              <fa-icon [icon]="faClipboardList" class="text-5xl block mb-4 text-muted-foreground"></fa-icon>
              <p class="text-lg font-medium">Nenhuma atividade recente</p>
              <p class="text-sm text-muted-foreground mt-1">As atividades aparecerão aqui quando houver</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-xl font-bold text-foreground mb-6">Próximos Vencimentos</h3>
          <div class="space-y-3">
            <div class="text-center py-12 text-muted-foreground">
              <fa-icon [icon]="faCalendarAlt" class="text-5xl block mb-4 text-muted-foreground"></fa-icon>
              <p class="text-lg font-medium">Nenhum vencimento próximo</p>
              <p class="text-sm text-muted-foreground mt-1">Os vencimentos aparecerão aqui</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  // FontAwesome icons
  faUsers = faUsers;
  faMoneyBillWave = faMoneyBillWave;
  faCreditCard = faCreditCard;
  faGem = faGem;
  faClipboardList = faClipboardList;
  faCalendarAlt = faCalendarAlt;

  // Dashboard metrics
  metrics = signal({
    total_clients: 0,
    total_loans: 0,
    total_payments_pending: 0,
    total_principal: 0,
    total_recebido: 0,
    total_em_aberto: 0
  });

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    await this.loadMetrics();
  }

  private async loadMetrics() {
    try {
      console.log('🔍 Carregando métricas do dashboard...');
      
      // Carregar métricas do dashboard
      const dashboardData = await this.dataService.getDashboardMetrics();
      console.log('📊 Dashboard data:', dashboardData);
      
      // Carregar contadores adicionais
      const clients = await this.dataService.listClients();
      console.log('👥 Clientes:', clients);
      
      const loans = await this.dataService.listLoans();
      console.log('💰 Empréstimos:', loans);
      
      const payments = await this.dataService.listPayments();
      console.log('💳 Pagamentos:', payments);
      
      const metrics = {
        total_clients: clients.length,
        total_loans: loans.length,
        total_payments_pending: payments.filter((p: any) => p.status === 'pending').length,
        total_principal: dashboardData.total_principal || 0,
        total_recebido: dashboardData.total_recebido || 0,
        total_em_aberto: dashboardData.total_em_aberto || 0
      };
      
      console.log('📈 Métricas calculadas:', metrics);
      this.metrics.set(metrics);
      
    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error);
    }
  }
}