import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { LucideAngularModule, DollarSign, Wallet, TrendingUp, AlertTriangle, Users, CreditCard, CalendarDays, ArrowUp, FileSpreadsheet } from 'lucide-angular';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ExportService } from '../../core/export.service';
import { TranslateModule } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CurrencyPipe, DecimalPipe, DatePipe, TranslateModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  readonly DollarSign = DollarSign;
  readonly Wallet = Wallet;
  readonly TrendingUp = TrendingUp;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly AlertTriangle = AlertTriangle;
  readonly Users = Users;
  readonly CreditCard = CreditCard;
  readonly CalendarDays = CalendarDays;
  readonly ArrowUp = ArrowUp;

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

  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);
  exporting = signal(false);

  async ngOnInit() {
    // Garantir que o loading seja exibido por pelo menos um momento
    this.loading.set(true);
    this.loadingInstallments.set(true);
    this.loadingCharts.set(true);
    
    // Aguardar um frame de renderização antes de começar a carregar
    await new Promise(resolve => setTimeout(resolve, 50));
    
    await Promise.all([
      this.loadMetrics(),
      this.loadUpcomingInstallments(),
      this.loadMonthlyEvolution()
    ]);
  }

  async loadMetrics() {
    try {
      const [data] = await Promise.all([
        this.dataService.getDashboardMetrics(),
        // Garantir um delay mínimo de 800ms para o loading ser visível
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      this.metrics.set(data);
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao carregar métricas');
    } finally {
      this.loading.set(false);
    }
  }

  async loadUpcomingInstallments() {
    try {
      const [data] = await Promise.all([
        this.dataService.getUpcomingInstallments(7),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      this.upcomingInstallments.set(data);
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao carregar parcelas');
    } finally {
      this.loadingInstallments.set(false);
    }
  }

  async loadMonthlyEvolution() {
    try {
      const [data] = await Promise.all([
        this.dataService.getMonthlyEvolution(6),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
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

  async exportDashboard() {
    try {
      this.exporting.set(true);
      await this.exportService.exportDashboard();
      this.toastService.success('Relatório exportado com sucesso!');
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao exportar relatório');
    } finally {
      this.exporting.set(false);
    }
  }
}
