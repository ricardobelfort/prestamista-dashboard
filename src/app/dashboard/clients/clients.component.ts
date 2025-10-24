import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { faPlus, faUsers, faEdit, faTrash, faExclamationTriangle, faChartLine, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { InputMaskDirective } from './input-mask.directive';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ExportService } from '../../core/export.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { ClientHistoryModalComponent } from '../../shared/client-history-modal/client-history-modal.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule, ConfirmationModalComponent, ClientHistoryModalComponent, InputMaskDirective, TranslateModule],
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

  // FontAwesome icons
  faPlus = faPlus;
  faUsers = faUsers;
  faChartLine = faChartLine;
  faEdit = faEdit;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;
  faFileExcel = faFileExcel;

  private exportService = inject(ExportService);
  exporting = signal(false);

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