import { Component, ChangeDetectionStrategy, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Users, TrendingUp, SquarePen, Trash2, TriangleAlert, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputMaskDirective } from './input-mask.directive';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ExportService } from '../../core/export.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { ClientHistoryModalComponent } from '../../shared/client-history-modal/client-history-modal.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, ConfirmationModalComponent, ClientHistoryModalComponent, InputMaskDirective, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  // Signals for state management
  clients = signal<any[]>([]);
  routes = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Modal state
  showModal = signal(false);
  editing = signal<any | null>(null);
  savingClient = signal(false);
  
  // Confirmation modal state
  showConfirmation = signal(false);
  clientToDelete = signal<any>(null);
  deletingClient = signal(false);
  
  // History modal state
  showHistoryModal = signal(false);
  selectedClient = signal<any>(null);
  
  // Form for CRUD operations
  form;

  // Lucide icons
  readonly Plus = Plus;
  readonly Users = Users;
  readonly TrendingUp = TrendingUp;
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
  private router = inject(Router);
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
  totalItems = computed(() => this.clients().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  
  paginatedClients = computed(() => {
    let sorted = [...this.clients()];
    
    // Apply sorting
    const column = this.sortColumn();
    if (column) {
      sorted.sort((a, b) => {
        let aVal, bVal;
        
        switch (column) {
          case 'name':
            aVal = a.name || '';
            bVal = b.name || '';
            break;
          case 'phone':
            aVal = a.phone || '';
            bVal = b.phone || '';
            break;
          case 'route':
            aVal = a.routes?.name || '';
            bVal = b.routes?.name || '';
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

  constructor(private dataService: DataService, private fb: FormBuilder, private toast: ToastService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      address: [''],
      doc_id: [''],
      route_id: ['']
    });
  }

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);
      
      // Carregar clientes e rotas em paralelo
      const [clientsData, routesData] = await Promise.all([
        this.dataService.listClients(),
        this.dataService.listRoutes()
      ]);
      
      this.clients.set(clientsData || []);
      this.routes.set(routesData || []);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar dados');
    } finally {
      this.loading.set(false);
    }
  }

  trackByClientId(index: number, client: any): any {
    return client.id || index;
  }

  // CRUD Operations
  openModal(client?: any) {
    this.showModal.set(true);
    this.editing.set(client ?? null);
    if (client) {
      this.form.patchValue(client);
    } else {
      this.form.reset();
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.editing.set(null);
    this.form.reset();
  }

  async saveClient() {
    if (this.form.invalid || this.savingClient()) return;
    
    this.savingClient.set(true);
    const value = this.form.value;
    
    try {
      if (this.editing()) {
        await this.dataService.updateClient(this.editing().id, value);
        this.toast.success('Cliente atualizado com sucesso!');
      } else {
        await this.dataService.createClient(value);
        this.toast.success('Cliente criado com sucesso!');
      }
      this.closeModal();
      await this.ngOnInit(); // Recarrega a lista
    } catch (err: any) {
      this.toast.error('Erro ao salvar cliente: ' + err.message);
    } finally {
      this.savingClient.set(false);
    }
  }

  async deleteClient(client: any) {
    this.clientToDelete.set(client);
    this.showConfirmation.set(true);
  }
  
  async confirmDelete() {
    const client = this.clientToDelete();
    if (!client) return;
    
    this.deletingClient.set(true);
    try {
      await this.dataService.deleteClient(client.id);
      this.toast.success('Cliente removido com sucesso!');
      await this.ngOnInit(); // Recarrega a lista
    } catch (err: any) {
      this.toast.error('Erro ao remover cliente: ' + err.message);
    } finally {
      this.deletingClient.set(false);
      this.closeConfirmation();
    }
  }
  
  openHistoryModal(client: any) {
    this.selectedClient.set(client);
    this.showHistoryModal.set(true);
  }
  
  closeHistoryModal() {
    this.showHistoryModal.set(false);
    this.selectedClient.set(null);
  }

  handlePayInstallment(installment: any) {
    // Store installment data in sessionStorage to be retrieved by Collection component
    sessionStorage.setItem('pendingInstallment', JSON.stringify(installment));
    this.closeHistoryModal();
    this.router.navigate(['/dashboard/collection']);
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

  // Helper for route badges
  getRouteBadge(route: any): { label: string; class: string } {
    if (!route || !route.name) {
      return { label: 'Sem rota', class: 'bg-gray-100 text-gray-600' };
    }
    
    // Generate a consistent color based on route name
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800',
      'bg-cyan-100 text-cyan-800'
    ];
    
    const hash = route.name.split('').reduce((acc: number, char: string) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colorIndex = Math.abs(hash) % colors.length;
    
    return {
      label: route.name,
      class: colors[colorIndex]
    };
  }
  
  closeConfirmation() {
    this.showConfirmation.set(false);
    this.clientToDelete.set(null);
    this.deletingClient.set(false);
  }

  async exportClients() {
    try {
      this.exporting.set(true);
      await this.exportService.exportClients();
      this.toast.success('Clientes exportados com sucesso!');
    } catch (error: any) {
      this.toast.error(error.message || 'Erro ao exportar clientes');
    } finally {
      this.exporting.set(false);
    }
  }

  async exportClientHistory(client: any) {
    try {
      await this.exportService.exportClientHistory(client.id, client.name);
      this.toast.success('Histórico exportado com sucesso!');
    } catch (error: any) {
      this.toast.error(error.message || 'Erro ao exportar histórico');
    }
  }
}