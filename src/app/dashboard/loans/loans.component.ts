import { Component, ChangeDetectionStrategy, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, DollarSign, SquarePen, Trash2, AlertTriangle, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-angular';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ExportService } from '../../core/export.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedCurrencyPipe } from '../../shared/pipes/localized-currency.pipe';

@Component({
  selector: 'app-loans',
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, ConfirmationModalComponent, DatePipe, TranslateModule, LocalizedCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loans.component.html'
})
export class LoansComponent implements OnInit {
  // Signals for state management
  loans = signal<any[]>([]);
  clients = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Modal state
  showModal = signal(false);
  editing = signal(false);
  editingLoan = signal<any>(null);
  savingLoan = signal(false);
  
  // Confirmation modal state
  showConfirmation = signal(false);
  loanToDelete = signal<any>(null);
  deletingLoan = signal(false);
  
  // Form
  form: FormGroup;

  // Lucide icons
  readonly Plus = Plus;
  readonly DollarSign = DollarSign;
  readonly Edit = SquarePen;
  readonly Trash2 = Trash2;
  readonly AlertTriangle = AlertTriangle;
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
  totalItems = computed(() => this.loans().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  
  paginatedLoans = computed(() => {
    let sorted = [...this.loans()];
    
    // Apply sorting
    const column = this.sortColumn();
    if (column) {
      sorted.sort((a, b) => {
        let aVal, bVal;
        
        switch (column) {
          case 'client':
            aVal = a.clients?.name || '';
            bVal = b.clients?.name || '';
            break;
          case 'principal':
            aVal = a.principal || 0;
            bVal = b.principal || 0;
            break;
          case 'date':
            aVal = new Date(a.start_date).getTime();
            bVal = new Date(b.start_date).getTime();
            break;
          case 'status':
            aVal = a.status || '';
            bVal = b.status || '';
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
      client_id: ['', Validators.required],
      principal: ['', [Validators.required, Validators.min(0.01)]],
      interest_rate: ['', [Validators.min(0)]],
      installments_count: ['', [Validators.required, Validators.min(1)]],
      start_date: ['', Validators.required],
      notes: ['']
    });
  }

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);
      
      // Carregar empréstimos e clientes em paralelo
      const [loansData, clientsData] = await Promise.all([
        this.dataService.listLoans(),
        this.dataService.listClients()
      ]);
      
      this.loans.set(loansData || []);
      this.clients.set(clientsData || []);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar empréstimos');
    } finally {
      this.loading.set(false);
    }
  }

  // Modal methods
  openModal(loan?: any) {
    this.editing.set(!!loan);
    this.editingLoan.set(loan);
    this.showModal.set(true);
    
    if (loan) {
      // Formatar a data para o input type="date"
      let formattedDate = loan.start_date;
      if (loan.start_date) {
        const date = new Date(loan.start_date);
        // Formato: YYYY-MM-DD
        formattedDate = date.toISOString().slice(0, 10);
      }

      // Workaround: Se não temos client_id, encontrar pelo client_name
      let clientId = loan.client_id;
      if (!clientId && loan.client_name) {
        const foundClient = this.clients().find(c => c.name === loan.client_name);
        clientId = foundClient?.id || '';
      }

      // Para edição, preencher o formulário
      this.form.patchValue({
        client_id: clientId,
        principal: loan.principal,
        interest_rate: loan.interest_rate,
        installments_count: loan.installments_count,
        start_date: formattedDate,
        notes: loan.notes
      });
    } else {
      // Para novo empréstimo, resetar o formulário com valores padrão
      this.form.reset({
        client_id: '',
        principal: '',
        interest_rate: '',
        installments_count: '',
        start_date: '',
        notes: ''
      });
    }
  }
  
  closeModal() {
    this.showModal.set(false);
    this.editing.set(false);
    this.editingLoan.set(null);
    this.form.reset();
  }
  
  async saveLoan() {
    if (this.form.invalid || this.savingLoan()) return;
    
    try {
      this.savingLoan.set(true);
      const formData = this.form.value;
      
      if (this.editing()) {
        // Editar empréstimo existente
        const loan = this.editingLoan();
        await this.dataService.updateLoan(loan.id, formData);
        this.toastService.success('Empréstimo atualizado com sucesso!');
      } else {
        // Criar novo empréstimo
        await this.dataService.createLoan(formData);
        this.toastService.success('Empréstimo criado com sucesso!');
      }
      
      // Recarregar lista
      await this.ngOnInit();
      this.closeModal();
      
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao salvar empréstimo');
    } finally {
      this.savingLoan.set(false);
    }
  }
  
  async deleteLoan(loan: any) {
    this.loanToDelete.set(loan);
    this.showConfirmation.set(true);
  }
  
  async confirmDelete() {
    const loan = this.loanToDelete();
    if (!loan) return;
    
    this.deletingLoan.set(true);
    try {
      await this.dataService.deleteLoan(loan.id);
      this.toastService.success('Empréstimo excluído com sucesso!');
      
      // Recarregar lista
      await this.ngOnInit();
      
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao excluir empréstimo');
    } finally {
      this.deletingLoan.set(false);
      this.closeConfirmation();
    }
  }
  
  closeConfirmation() {
    this.showConfirmation.set(false);
    this.loanToDelete.set(null);
    this.deletingLoan.set(false);
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

  trackByLoanId(index: number, loan: any): any {
    return loan?.id;
  }

  trackByClientId(index: number, client: any): any {
    return client?.id;
  }

  async exportLoans() {
    try {
      this.exporting.set(true);
      await this.exportService.exportLoans();
      this.toastService.success('Empréstimos exportados com sucesso!');
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao exportar empréstimos');
    } finally {
      this.exporting.set(false);
    }
  }
}