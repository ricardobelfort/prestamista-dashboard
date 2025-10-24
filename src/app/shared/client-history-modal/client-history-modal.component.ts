import { Component, signal, inject, ChangeDetectionStrategy, input, output, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, X, CheckCircle2, AlertCircle, Clock, Banknote, TrendingUp, Trophy, Calendar, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-angular';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ExportService } from '../../core/export.service';

@Component({
  selector: 'app-client-history-modal',
  imports: [CommonModule, LucideAngularModule, CurrencyPipe, DatePipe, DecimalPipe],
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
  readonly X = X;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly Clock = Clock;
  readonly Banknote = Banknote;
  readonly TrendingUp = TrendingUp;
  readonly Trophy = Trophy;
  readonly Calendar = Calendar;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly FileSpreadsheet = FileSpreadsheet;

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
    if (status === 'paid') return this.CheckCircle2;
    if (status === 'overdue') return this.AlertCircle;
    return this.Clock;
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
