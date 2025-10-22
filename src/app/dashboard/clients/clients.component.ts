import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { faPlus, faUsers, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule, ConfirmationModalComponent],
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
  
  // Confirmation modal state
  showConfirmation = signal(false);
  clientToDelete = signal<any>(null);
  
  // Form for CRUD operations
  form;

  // FontAwesome icons
  faPlus = faPlus;
  faUsers = faUsers;
  faEdit = faEdit;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;

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
      console.error('Error loading data:', err);
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
    if (this.form.invalid) return;
    
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
    }
  }

  async deleteClient(client: any) {
    this.clientToDelete.set(client);
    this.showConfirmation.set(true);
  }
  
  async confirmDelete() {
    const client = this.clientToDelete();
    if (!client) return;
    
    try {
      await this.dataService.deleteClient(client.id);
      this.toast.success('Cliente removido com sucesso!');
      await this.ngOnInit(); // Recarrega a lista
    } catch (err: any) {
      this.toast.error('Erro ao remover cliente: ' + err.message);
    } finally {
      this.closeConfirmation();
    }
  }
  
  closeConfirmation() {
    this.showConfirmation.set(false);
    this.clientToDelete.set(null);
  }
}