import { Component, signal, inject, ChangeDetectionStrategy, input, output, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faCheckCircle,
  faExclamationCircle,
  faClock,
  faMoneyBill,
  faChartLine,
  faTrophy,
  faCalendar,
  faChevronDown,
  faChevronUp,
  faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ExportService } from '../../core/export.service';

@Component({
  selector: 'app-client-history-modal',
  imports: [CommonModule, FontAwesomeModule, CurrencyPipe, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './client-history-modal.component.html'
})
export class ClientHistoryModalComponent implements OnInit {
  // Modern Angular inputs/outputs using functions
  clientId = input.required<string>();
  clientName = input.required<string>();
  close = output<void>();

  // Inject services using inject() function
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);

  // Icons
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  faClock = faClock;
  faMoneyBill = faMoneyBill;
  faChartLine = faChartLine;
  faTrophy = faTrophy;
  faCalendar = faCalendar;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faFileExcel = faFileExcel;

  loading = signal(true);
  summary = signal<any>({
    total_loaned: 0,
    total_paid: 0,
    total_outstanding: 0,
    total_overdue: 0,
    on_time_payments: 0,
    late_payments: 0,
    total_payments: 0,
    payment_score: 0
  });
  loans = signal<any[]>([]);
  expandedLoanId = signal<string | null>(null);

  async ngOnInit() {
    await this.loadHistory();
  }

  async loadHistory() {
    try {
      this.loading.set(true);
      const data = await this.dataService.getClientFinancialHistory(this.clientId());
      this.summary.set(data.summary);
      this.loans.set(data.loans || []);
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao carregar histórico');
    } finally {
      this.loading.set(false);
    }
  }

  toggleLoan(loanId: string) {
    this.expandedLoanId.set(this.expandedLoanId() === loanId ? null : loanId);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  }

  getLoanStatusClass(status: string): string {
    const classes: any = {
      'active': 'bg-blue-100 text-blue-800',
      'paid': 'bg-emerald-100 text-emerald-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getLoanStatusLabel(status: string): string {
    const labels: any = {
      'active': 'Ativo',
      'paid': 'Pago',
      'overdue': 'Vencido'
    };
    return labels[status] || status;
  }

  getInstallmentIcon(status: string) {
    if (status === 'paid') return faCheckCircle;
    if (status === 'overdue') return faExclamationCircle;
    return faClock;
  }

  getInstallmentIconColor(status: string): string {
    if (status === 'paid') return 'text-emerald-600';
    if (status === 'overdue') return 'text-red-600';
    if (status === 'partial') return 'text-amber-600';
    return 'text-blue-600';
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  async exportHistory() {
    try {
      await this.exportService.exportClientHistory(this.clientId(), this.clientName());
      this.toastService.success('Histórico exportado com sucesso!');
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao exportar histórico');
    }
  }
}
