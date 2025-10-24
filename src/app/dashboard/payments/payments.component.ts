import { Component, ChangeDetectionStrategy, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, CreditCard, SquarePen, Trash2, TriangleAlert, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-angular';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ExportService } from '../../core/export.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedCurrencyPipe } from '../../shared/pipes/localized-currency.pipe';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, ConfirmationModalComponent, DatePipe, TranslateModule, LocalizedCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments.component.html'
})
export class PaymentsComponent implements OnInit {
  // Signals for state management
  payments = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Modal state
  showModal = signal(false);
  editing = signal(false);
  editingPayment = signal<any>(null);
  savingPayment = signal(false);
  
  // Confirmation modal state
  showConfirmation = signal(false);
  paymentToDelete = signal<any>(null);
  deletingPayment = signal(false);
  
  // Form
  form: FormGroup;

  // Mapeamento de métodos (backend -> frontend)
  methodMapping = {
    'cash': 'money',
    'money': 'money',
    'pix': 'pix', 
    'card': 'card',
    'bank_transfer': 'bank_transfer'
  } as const;

  // Mapeamento reverso (frontend -> backend)
  reverseMethodMapping = {
    'money': 'cash',
    'pix': 'pix',
    'card': 'card', 
    'bank_transfer': 'bank_transfer'
  } as const;

  // Lucide icons
  readonly Plus = Plus;
  readonly CreditCard = CreditCard;
  readonly Edit = SquarePen;
  readonly Trash2 = Trash2;
  readonly AlertTriangle = TriangleAlert;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly ArrowUpDown = ArrowUpDown;
  readonly ArrowUp = ArrowUp;
  readonly ArrowDown = ArrowDown;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  private exportService = inject(ExportService);
  exporting = signal(false);

  // Make Math available in template
  Math = Math;

  // Sorting state
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination state
  currentPage = signal(1);
  itemsPerPage = signal(10);
  
  // Computed values
  totalItems = computed(() => this.payments().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  
  paginatedPayments = computed(() => {
    let sorted = [...this.payments()];
    
    // Apply sorting
    const column = this.sortColumn();
    if (column) {
      sorted.sort((a, b) => {
        let aVal, bVal;
        
        switch (column) {
          case 'client':
            aVal = a.installments?.loans?.clients?.name || '';
            bVal = b.installments?.loans?.clients?.name || '';
            break;
          case 'value':
            aVal = a.value || 0;
            bVal = b.value || 0;
            break;
          case 'date':
            aVal = new Date(a.paid_on).getTime();
            bVal = new Date(b.paid_on).getTime();
            break;
          case 'method':
            aVal = a.method || '';
            bVal = b.method || '';
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return this.sortDirection() === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection() === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // Apply pagination
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return sorted.slice(start, end);
  });

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      installment_id: [''], // Não obrigatório por padrão, será definido quando necessário
      value: ['', [Validators.required, Validators.min(0.01)]],
      method: ['money', Validators.required],
      paid_on: ['', Validators.required],
      notes: ['']
    });
  }

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.dataService.listPayments();
      this.payments.set(data || []);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar pagamentos');
    } finally {
      this.loading.set(false);
    }
  }

  // Modal methods
  openModal(payment?: any) {
    this.editing.set(!!payment);
    this.editingPayment.set(payment);
    this.showModal.set(true);
    
    if (payment) {
      // Para edição, installment_id é obrigatório
      this.form.get('installment_id')?.setValidators([Validators.required]);
      this.form.get('installment_id')?.updateValueAndValidity();
      
      // Formatar apenas a data (sem horário)
      let formattedDate = '';
      if (payment.paid_on) {
        const date = new Date(payment.paid_on);
        // Formato: YYYY-MM-DD
        formattedDate = date.toISOString().slice(0, 10);
      }

      // Mapear o método do backend para o frontend
      const mappedMethod = this.methodMapping[payment.method as keyof typeof this.methodMapping] || 'money';
      
      // Para edição, preencher o formulário
      this.form.patchValue({
        installment_id: payment.installment_id || '',
        value: payment.value || '',
        method: mappedMethod,
        paid_on: formattedDate,
        notes: payment.notes || ''
      });
    } else {
      // Para novo pagamento, installment_id não é obrigatório (será gerado automaticamente)
      this.form.get('installment_id')?.clearValidators();
      this.form.get('installment_id')?.updateValueAndValidity();
      
      // Para novo pagamento, resetar o formulário
      this.form.reset({
        method: 'money'
      });
    }
  }
  
  closeModal() {
    this.showModal.set(false);
    this.editing.set(false);
    this.editingPayment.set(null);
    this.form.reset();
  }
  
  async savePayment() {
    if (this.form.invalid || this.savingPayment()) return;
    
    try {
      this.savingPayment.set(true);
      const formData = { ...this.form.value };
      
      // Converter a data para o formato ISO se necessário
      if (formData.paid_on) {
        const date = new Date(formData.paid_on);
        formData.paid_on = date.toISOString();
      }

      // Converter o método do frontend para o backend
      if (formData.method) {
        formData.method = this.reverseMethodMapping[formData.method as keyof typeof this.reverseMethodMapping] || formData.method;
      }
      
      if (this.editing()) {
        // Editar pagamento existente
        const payment = this.editingPayment();
        await this.dataService.updatePayment(payment.id, formData);
        this.toastService.success('Pagamento atualizado com sucesso!');
      } else {
        // Criar novo pagamento
        await this.dataService.createPayment(formData);
        this.toastService.success('Pagamento registrado com sucesso!');
      }
      
      // Recarregar lista
      await this.ngOnInit();
      this.closeModal();
      
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao salvar pagamento');
    } finally {
      this.savingPayment.set(false);
    }
  }
  
  async deletePayment(payment: any) {
    this.paymentToDelete.set(payment);
    this.showConfirmation.set(true);
  }
  
  async confirmDelete() {
    const payment = this.paymentToDelete();
    if (!payment) return;
    
    this.deletingPayment.set(true);
    try {
      await this.dataService.deletePayment(payment.id);
      this.toastService.success('Pagamento excluído com sucesso!');
      
      // Recarregar lista
      await this.ngOnInit();
      
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao excluir pagamento');
    } finally {
      this.deletingPayment.set(false);
      this.closeConfirmation();
    }
  }
  
  closeConfirmation() {
    this.showConfirmation.set(false);
    this.paymentToDelete.set(null);
    this.deletingPayment.set(false);
  }

  // Sorting methods
  toggleSort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1); // Reset to first page when sorting
  }

  getSortIcon(column: string): any {
    if (this.sortColumn() !== column) return this.ArrowUpDown;
    return this.sortDirection() === 'asc' ? this.ArrowUp : this.ArrowDown;
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  // Helper for payment method badges
  getMethodBadge(method: string): { label: string; class: string } {
    const normalizedMethod = (method || '').toLowerCase();
    
    const badges: Record<string, { label: string; class: string }> = {
      'cash': { label: 'Dinheiro', class: 'bg-emerald-100 text-emerald-800' },
      'dinheiro': { label: 'Dinheiro', class: 'bg-emerald-100 text-emerald-800' },
      'money': { label: 'Dinheiro', class: 'bg-emerald-100 text-emerald-800' },
      'pix': { label: 'PIX', class: 'bg-blue-100 text-blue-800' },
      'card': { label: 'Cartão', class: 'bg-purple-100 text-purple-800' },
      'cartão': { label: 'Cartão', class: 'bg-purple-100 text-purple-800' },
      'bank_transfer': { label: 'Transferência', class: 'bg-indigo-100 text-indigo-800' },
      'transferência': { label: 'Transferência', class: 'bg-indigo-100 text-indigo-800' },
      'transfer': { label: 'Transferência', class: 'bg-indigo-100 text-indigo-800' },
      'check': { label: 'Cheque', class: 'bg-amber-100 text-amber-800' },
      'cheque': { label: 'Cheque', class: 'bg-amber-100 text-amber-800' }
    };
    
    return badges[normalizedMethod] || { label: method, class: 'bg-muted text-muted-foreground' };
  }

  trackByPaymentId(index: number, payment: any): any {
    return payment.id || index;
  }

  async exportPayments() {
    try {
      this.exporting.set(true);
      await this.exportService.exportPayments();
      this.toastService.success('Pagamentos exportados com sucesso!');
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao exportar pagamentos');
    } finally {
      this.exporting.set(false);
    }
  }
}