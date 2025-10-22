import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faDollarSign, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-loans',
  imports: [CommonModule, FontAwesomeModule, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loans.component.html'
})
export class LoansComponent implements OnInit {
  // Signals for state management
  loans = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // FontAwesome icons
  faPlus = faPlus;
  faDollarSign = faDollarSign;
  faEdit = faEdit;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.dataService.listLoans();
      this.loans.set(data || []);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar empréstimos');
      console.error('Error loading loans:', err);
    } finally {
      this.loading.set(false);
    }
  }

  trackByLoanId(index: number, loan: any): any {
    return loan.id || index;
  }
}