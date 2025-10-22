import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faCreditCard, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FontAwesomeModule, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments.component.html'
})
export class PaymentsComponent implements OnInit {
  // Signals for state management
  payments = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // FontAwesome icons
  faPlus = faPlus;
  faCreditCard = faCreditCard;
  faEdit = faEdit;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.dataService.listPayments();
      this.payments.set(data || []);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar pagamentos');
      console.error('Error loading payments:', err);
    } finally {
      this.loading.set(false);
    }
  }

  trackByPaymentId(index: number, payment: any): any {
    return payment.id || index;
  }
}