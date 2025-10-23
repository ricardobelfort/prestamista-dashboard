import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faCreditCard, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule, ConfirmationModalComponent, CurrencyPipe, DatePipe],
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

  // FontAwesome icons
  faPlus = faPlus;
  faCreditCard = faCreditCard;
  faEdit = faEdit;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;

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
    
    try {
      this.loading.set(true);
      await this.dataService.deletePayment(payment.id);
      this.toastService.success('Pagamento excluído com sucesso!');
      
      // Recarregar lista
      await this.ngOnInit();
      
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao excluir pagamento');
    } finally {
      this.loading.set(false);
      this.closeConfirmation();
    }
  }
  
  closeConfirmation() {
    this.showConfirmation.set(false);
    this.paymentToDelete.set(null);
  }

  trackByPaymentId(index: number, payment: any): any {
    return payment.id || index;
  }
}