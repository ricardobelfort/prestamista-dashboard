import { Component, ChangeDetectionStrategy, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faDollarSign,
  faMoneyBillWave, 
  faChartLine,
  faExclamationTriangle,
  faUsers,
  faCreditCard,
  faCalendarAlt,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { TranslateModule } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, CurrencyPipe, DecimalPipe, DatePipe, TranslateModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  faDollarSign = faDollarSign;
  faMoneyBillWave = faMoneyBillWave;
  faChartLine = faChartLine;
  faExclamationTriangle = faExclamationTriangle;
  faUsers = faUsers;
  faCreditCard = faCreditCard;
  faCalendarAlt = faCalendarAlt;
  faArrowUp = faArrowUp;

  loading = signal(true);
  loadingInstallments = signal(true);
  metrics = signal({
    total_loaned: 0,
    total_received: 0,
    total_expected: 0,
    total_overdue: 0,
    profit: 0,
    expected_profit: 0,
    active_loans: 0,
    total_clients: 0,
    overdue_installments: 0,
    default_rate: 0
  });
  upcomingInstallments = signal<any[]>([]);
  monthlyEvolution = signal<any[]>([]);
  loadingCharts = signal(true);

  // Chart data
  lineChartData = signal<ChartData<'line'>>({
    labels: [],
    datasets: []
  });

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => `R$ ${value}` } }
    }
  };

  doughnutChartData = signal<ChartData<'doughnut'>>({
    labels: ['Pagas', 'Pendentes', 'Vencidas'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#10b981', '#3b82f6', '#ef4444']
    }]
  });

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  profitPercentage = computed(() => {
    const loaned = this.metrics().total_loaned;
    if (loaned === 0) return 0;
    return (this.metrics().total_received / loaned) * 100;
  });

  constructor(
    private dataService: DataService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadMetrics(),
      this.loadUpcomingInstallments(),
      this.loadMonthlyEvolution()
    ]);
  }

  async loadMetrics() {
    try {
      this.loading.set(true);
      const data = await this.dataService.getDashboardMetrics();
      this.metrics.set(data);
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao carregar métricas');
    } finally {
      this.loading.set(false);
    }
  }

  async loadUpcomingInstallments() {
    try {
      this.loadingInstallments.set(true);
      const data = await this.dataService.getUpcomingInstallments(7);
      this.upcomingInstallments.set(data);
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao carregar parcelas');
    } finally {
      this.loadingInstallments.set(false);
    }
  }

  async loadMonthlyEvolution() {
    try {
      this.loadingCharts.set(true);
      const data = await this.dataService.getMonthlyEvolution(6);
      this.monthlyEvolution.set(data);
      
      // Update line chart
      const labels = data.map((d: any) => d.month_label);
      const loanedData = data.map((d: any) => d.total_loaned || 0);
      const receivedData = data.map((d: any) => d.total_received || 0);
      
      this.lineChartData.set({
        labels,
        datasets: [
          {
            label: 'Emprestado',
            data: loanedData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Recebido',
            data: receivedData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      });

      // Update doughnut chart with installment status
      await this.loadInstallmentStats();
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao carregar evolução mensal');
    } finally {
      this.loadingCharts.set(false);
    }
  }

  async loadInstallmentStats() {
    try {
      const installments = await this.dataService.listInstallments();
      
      const paid = installments.filter((i: any) => i.paid_amount >= i.amount).length;
      const overdue = installments.filter((i: any) => 
        new Date(i.due_date) < new Date() && i.paid_amount < i.amount
      ).length;
      const pending = installments.filter((i: any) => 
        new Date(i.due_date) >= new Date() && i.paid_amount < i.amount
      ).length;

      this.doughnutChartData.set({
        labels: ['Pagas', 'Pendentes', 'Vencidas'],
        datasets: [{
          data: [paid, pending, overdue],
          backgroundColor: ['#10b981', '#3b82f6', '#ef4444']
        }]
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas de parcelas:', error);
    }
  }
}
