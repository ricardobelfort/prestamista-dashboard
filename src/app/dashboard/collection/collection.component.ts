import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Search, HandCoins, DollarSign, AlertTriangle, CheckCircle, Clock, XCircle, Filter, Calendar } from 'lucide-angular';
import { DataService } from '../../core/data.service';
import { SupabaseService } from '../../core/supabase.service';
import { ToastService } from '../../core/toast.service';
import { ReceiptService } from '../../core/receipt.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalizedCurrencyPipe } from '../../shared/pipes/localized-currency.pipe';
import confetti from 'canvas-confetti';

interface Installment {
  id: string;
  loan_id: string;
  index_no: number;
  due_date: string;
  amount: number;
  paid_amount: number;
}

interface Loan {
  id: string;
  principal: number;
  interest_rate: number;
  client_id: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface InstallmentWithDetails {
  id: string;
  loan_id: string;
  index_no: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  days_overdue: number;
  loan: {
    id: string;
    principal: number;
    interest_rate: number;
    client_id: string;
  };
  client: {
    id: string;
    name: string;
    phone: string;
  };
}

@Component({
  selector: 'app-collection',
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, TranslateModule, LocalizedCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  // Icons
  readonly Search = Search;
  readonly HandCoins = HandCoins;
  readonly DollarSign = DollarSign;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly XCircle = XCircle;
  readonly Filter = Filter;
  readonly Calendar = Calendar;

  // Services
  private dataService = inject(DataService);
  private supabase = inject(SupabaseService);
  private toastService = inject(ToastService);
  private receiptService = inject(ReceiptService);
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);

  // State
  installments = signal<InstallmentWithDetails[]>([]);
  loading = signal(true);
  filterStatus = signal<'all' | 'overdue' | 'today' | 'pending'>('all');
  searchTerm = signal('');

    // Modal state
  showPaymentModal = signal(false);
  selectedInstallment = signal<InstallmentWithDetails | null>(null);
  savingPayment = signal(false);
  lastPaymentData = signal<any>(null);

  // Confetti animation control
  private confettiInterval: any = null;

  // Form
  paymentForm: FormGroup;

  // Computed values
  filteredInstallments = computed(() => {
    let items = this.installments();
    const search = this.searchTerm().toLowerCase();
    const filter = this.filterStatus();

    // Apply search filter
    if (search) {
      items = items.filter(inst => 
        inst.client.name.toLowerCase().includes(search) ||
        inst.client.phone?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    switch (filter) {
      case 'overdue':
        items = items.filter(inst => inst.status === 'overdue');
        break;
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        items = items.filter(inst => inst.due_date === today && inst.status !== 'paid');
        break;
      case 'pending':
        items = items.filter(inst => inst.status === 'pending' || inst.status === 'partial');
        break;
    }

    // Sort by due date (oldest first)
    return items.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  });

  // Statistics
  totalOverdue = computed(() => {
    return this.installments()
      .filter(inst => inst.status === 'overdue')
      .reduce((sum, inst) => sum + inst.remaining_amount, 0);
  });

  countOverdue = computed(() => {
    return this.installments().filter(inst => inst.status === 'overdue').length;
  });

  totalToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.installments()
      .filter(inst => inst.due_date === today && inst.status !== 'paid')
      .reduce((sum, inst) => sum + inst.remaining_amount, 0);
  });

  countToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.installments().filter(inst => inst.due_date === today && inst.status !== 'paid').length;
  });

  constructor() {
    this.paymentForm = this.fb.group({
      value: ['', [Validators.required, Validators.min(0.01)]],
      method: ['money', Validators.required],
      paid_on: [new Date().toISOString().split('T')[0], Validators.required],
      notes: ['']
    });

    // Watch for payment success and trigger confetti
    effect(() => {
      const paymentData = this.lastPaymentData();
      if (paymentData) {
        setTimeout(() => this.launchConfetti(), 100);
      }
    });
  }

  private launchConfetti() {
    // Clear any existing interval
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
    }

    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    // Run confetti continuously
    this.confettiInterval = setInterval(() => {
      confetti({
        ...defaults,
        particleCount: 30,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount: 30,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 400);
  }

  private stopConfetti() {
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
      this.confettiInterval = null;
    }
  }

  async ngOnInit() {
    await this.loadInstallments();
    this.checkPendingInstallment();
  }

  async checkPendingInstallment() {
    const pendingData = sessionStorage.getItem('pendingInstallment');
    if (pendingData) {
      try {
        const installment = JSON.parse(pendingData);
        sessionStorage.removeItem('pendingInstallment');
        
        // Find the full installment data from our loaded list
        const fullInstallment = this.installments().find(inst => inst.id === installment.id);
        
        if (fullInstallment) {
          this.openPaymentModal(fullInstallment);
        } else {
          // Fetch full installment data from API
          try {
            const { data: installmentData, error } = await this.supabase.client
              .from('installments')
              .select('*')
              .eq('id', installment.id)
              .single();

            if (error) throw error;

            // Fetch loan data
            const { data: loanData, error: loanError } = await this.supabase.client
              .from('loans')
              .select('id, principal, interest_rate, client_id')
              .eq('id', installmentData.loan_id)
              .single();

            if (loanError) throw loanError;

            // Fetch client data
            const { data: clientData, error: clientError } = await this.supabase.client
              .from('clients')
              .select('id, name, phone')
              .eq('id', loanData.client_id)
              .single();

            if (clientError) throw clientError;

            // Build enriched installment
            const enrichedInstallment: InstallmentWithDetails = {
              ...installmentData,
              remaining_amount: installmentData.amount - installmentData.paid_amount,
              loan: loanData,
              client: clientData
            };

            this.openPaymentModal(enrichedInstallment);
          } catch (error) {
            console.error('Error fetching installment data:', error);
            this.toastService.error('Erro ao carregar dados da parcela');
          }
        }
      } catch (error) {
        console.error('Error processing pending installment:', error);
      }
    }
  }

  async loadInstallments() {
    try {
      this.loading.set(true);
      
      // Buscar todas as parcelas não pagas
      const [installments, loans, clients] = await Promise.all([
        this.dataService.listInstallments(),
        this.dataService.listLoans(),
        this.dataService.listClients()
      ]);

      // Criar mapa de empréstimos e clientes para busca rápida
      const loansMap = new Map<string, Loan>(
        (loans as Loan[]).map(loan => [loan.id, loan])
      );
      const clientsMap = new Map<string, Client>(
        (clients as Client[]).map(client => [client.id, client])
      );

      // Enriquecer parcelas com dados de empréstimo e cliente
      const enrichedInstallments: InstallmentWithDetails[] = (installments as Installment[])
        .map(inst => {
          const loan = loansMap.get(inst.loan_id);
          if (!loan) return null;

          const client = clientsMap.get(loan.client_id);
          if (!client) return null;

          const paidAmount = inst.paid_amount || 0;
          const remainingAmount = inst.amount - paidAmount;

          // Calcular status
          let status: 'paid' | 'pending' | 'overdue' | 'partial' = 'pending';
          const today = new Date();
          const dueDate = new Date(inst.due_date);
          
          if (paidAmount >= inst.amount) {
            status = 'paid';
          } else if (dueDate < today && paidAmount < inst.amount) {
            status = 'overdue';
          } else if (paidAmount > 0 && paidAmount < inst.amount) {
            status = 'partial';
          }

          // Calcular dias de atraso
          const daysOverdue = status === 'overdue' 
            ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          return {
            id: inst.id,
            loan_id: inst.loan_id,
            index_no: inst.index_no,
            due_date: inst.due_date,
            amount: inst.amount,
            paid_amount: paidAmount,
            remaining_amount: remainingAmount,
            status,
            days_overdue: daysOverdue,
            loan: {
              id: loan.id,
              principal: loan.principal,
              interest_rate: loan.interest_rate,
              client_id: loan.client_id
            },
            client: {
              id: client.id,
              name: client.name,
              phone: client.phone
            }
          };
        })
        .filter((inst): inst is InstallmentWithDetails => inst !== null)
        .filter(inst => inst.status !== 'paid'); // Filtrar apenas não pagas

      this.installments.set(enrichedInstallments);
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao carregar parcelas');
    } finally {
      this.loading.set(false);
    }
  }

  setFilter(filter: 'all' | 'overdue' | 'today' | 'pending') {
    this.filterStatus.set(filter);
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  openPaymentModal(installment: InstallmentWithDetails) {
    this.selectedInstallment.set(installment);
    
    // Update form with dynamic max validator
    this.paymentForm.patchValue({
      value: installment.remaining_amount,
      method: 'money',
      paid_on: new Date().toISOString().split('T')[0],
      notes: ''
    });
    
    // Set validators with max value
    this.paymentForm.get('value')?.setValidators([
      Validators.required,
      Validators.min(0.01),
      Validators.max(installment.remaining_amount)
    ]);
    this.paymentForm.get('value')?.updateValueAndValidity();
    
    this.showPaymentModal.set(true);
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
    this.selectedInstallment.set(null);
    this.paymentForm.reset({
      method: 'money',
      paid_on: new Date().toISOString().split('T')[0]
    });
  }

  async savePayment() {
    if (this.paymentForm.invalid || !this.selectedInstallment()) return;

    try {
      this.savingPayment.set(true);
      const formValue = this.paymentForm.value;
      const installment = this.selectedInstallment()!;

      const payment = {
        installment_id: installment.id,
        value: parseFloat(formValue.value),
        method: formValue.method,
        paid_on: formValue.paid_on,
        notes: formValue.notes || null
      };

      await this.dataService.createPayment(payment);
      
      // Generate sequential payment ID with year
      const now = new Date();
      const year = now.getFullYear();
      const timestamp = now.getTime();
      const sequentialNumber = String(timestamp).slice(-6); // Last 6 digits of timestamp
      const paymentId = `PAG-${year}-${sequentialNumber}`;
      
      // Fetch additional loan data for receipt
      const { data: loanData } = await this.supabase.client
        .from('loans')
        .select('principal, interest_rate, installments_count, start_date, client:clients(name, phone, address, doc_id)')
        .eq('id', installment.loan_id)
        .single();
      
      // Calculate remaining balance and next due date
      const { data: allInstallments } = await this.supabase.client
        .from('installments')
        .select('index_no, amount, paid_amount, due_date')
        .eq('loan_id', installment.loan_id)
        .order('index_no', { ascending: true });
      
      let remainingBalance = 0;
      let nextDueDate = null;
      let nextInstallmentAmount = 0;
      let totalInstallmentsCount = 0;
      
      if (allInstallments && allInstallments.length > 0) {
        // Get total installments count
        totalInstallmentsCount = allInstallments.length;
        
        // Calculate total remaining
        remainingBalance = allInstallments.reduce((sum: number, inst: any) => {
          return sum + (inst.amount - (inst.paid_amount || 0));
        }, 0);
        
        // Find next unpaid installment (where paid_amount < amount)
        const nextInstallment = allInstallments.find((inst: any) => {
          const paidAmount = inst.paid_amount || 0;
          return paidAmount < inst.amount;
        });
        
        if (nextInstallment) {
          nextDueDate = nextInstallment.due_date;
          nextInstallmentAmount = nextInstallment.amount - (nextInstallment.paid_amount || 0);
        }
      }
      
      // Store payment data for receipt generation
      const clientData: any = loanData?.client?.[0] || installment.client;
      
      const receiptData = {
        clientName: clientData.name,
        clientPhone: clientData.phone || '',
        clientAddress: clientData.address || '',
        clientId: clientData.doc_id || clientData.document_id || '',
        installmentNumber: installment.index_no,
        totalInstallments: totalInstallmentsCount || loanData?.installments_count || 0,
        loanPrincipal: loanData?.principal || installment.loan.principal,
        loanStartDate: loanData?.start_date || '',
        installmentAmount: installment.amount,
        paidAmount: payment.value,
        remainingBalance: remainingBalance,
        paymentMethod: payment.method,
        paymentDate: payment.paid_on,
        dueDate: installment.due_date,
        nextDueDate: nextDueDate,
        nextInstallmentAmount: nextInstallmentAmount,
        notes: payment.notes,
        organizationName: 'Prestamista',
        organizationPhone: '',
        organizationAddress: '',
        paymentId: paymentId
      };
      
      this.lastPaymentData.set(receiptData);
      
      this.toastService.success(this.translate.instant('collection.successMessage'));
      this.closePaymentModal();
      await this.loadInstallments(); // Recarregar lista
    } catch (error: any) {
      this.toastService.error(error.message || this.translate.instant('collection.errorMessage'));
    } finally {
      this.savingPayment.set(false);
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'paid':
        return this.CheckCircle;
      case 'overdue':
        return this.AlertTriangle;
      case 'partial':
        return this.Clock;
      default:
        return this.Clock;
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'paid': this.translate.instant('collection.status.paid'),
      'overdue': this.translate.instant('collection.status.overdue'),
      'partial': this.translate.instant('collection.status.partial'),
      'pending': this.translate.instant('collection.status.pending')
    };
    return labels[status] || status;
  }

  getValueError(): string | null {
    const control = this.paymentForm.get('value');
    if (!control || !control.touched) return null;
    
    if (control.hasError('required')) {
      return this.translate.instant('collection.modal.valueRequired');
    }
    if (control.hasError('min')) {
      return this.translate.instant('collection.modal.valueMin');
    }
    if (control.hasError('max')) {
      const max = this.selectedInstallment()?.remaining_amount || 0;
      return `${this.translate.instant('collection.modal.valueMax')} ${this.formatCurrency(max)}`;
    }
    return null;
  }

  formatCurrency(value: number): string {
    // Use Intl.NumberFormat for formatting
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  printReceipt() {
    const data = this.lastPaymentData();
    if (!data) return;
    
    this.stopConfetti();
    this.receiptService.generateReceipt(data);
    this.lastPaymentData.set(null); // Clear after printing
  }

  closeReceiptDialog() {
    this.stopConfetti();
    this.lastPaymentData.set(null);
  }
}
