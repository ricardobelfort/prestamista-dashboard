import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faRoute, faEdit, faTrash, faExclamationTriangle, faEye } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-routes',
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule, ConfirmationModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './routes.component.html'
})
export class RoutesComponent implements OnInit {
  // Signals for state management
  routes = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Modal state
  showModal = signal(false);
  editing = signal(false);
  editingRoute = signal<any>(null);
  
  // Details modal state
  showDetails = signal(false);
  selectedRoute = signal<any>(null);
  
  // Confirmation modal state
  showConfirmation = signal(false);
  routeToDelete = signal<any>(null);
  
  // Form
  form: FormGroup;

  // FontAwesome icons
  faPlus = faPlus;
  faRoute = faRoute;
  faEdit = faEdit;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;
  faEye = faEye;

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      assigned_to: [''],
      description: ['']
    });
  }

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.dataService.listRoutes();
      this.routes.set(data || []);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar rotas');
    } finally {
      this.loading.set(false);
    }
  }

  // Modal methods
  openModal(route?: any) {
    this.editing.set(!!route);
    this.editingRoute.set(route);
    this.showModal.set(true);
    
    if (route) {
      // Para edição, preencher o formulário
      this.form.patchValue({
        name: route.name,
        assigned_to: route.assigned_to,
        description: route.description
      });
    } else {
      // Para nova rota, resetar o formulário
      this.form.reset();
    }
  }
  
  closeModal() {
    this.showModal.set(false);
    this.editing.set(false);
    this.editingRoute.set(null);
    this.form.reset();
  }
  
  async saveRoute() {
    if (this.form.invalid) return;
    
    try {
      this.loading.set(true);
      const formData = this.form.value;
      
      if (this.editing()) {
        // Editar rota existente
        const route = this.editingRoute();
        await this.dataService.updateRoute(route.id, formData);
        this.toastService.success('Rota atualizada com sucesso!');
      } else {
        // Criar nova rota
        await this.dataService.createRoute(formData);
        this.toastService.success('Rota criada com sucesso!');
      }
      
      // Recarregar lista
      await this.ngOnInit();
      this.closeModal();
      
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao salvar rota');
    } finally {
      this.loading.set(false);
    }
  }
  
  // Details modal
  viewDetails(route: any) {
    this.selectedRoute.set(route);
    this.showDetails.set(true);
  }
  
  closeDetails() {
    this.showDetails.set(false);
    this.selectedRoute.set(null);
  }
  
  // Delete methods
  async deleteRoute(route: any) {
    this.routeToDelete.set(route);
    this.showConfirmation.set(true);
  }
  
  async confirmDelete() {
    const route = this.routeToDelete();
    if (!route) return;
    
    try {
      this.loading.set(true);
      await this.dataService.deleteRoute(route.id);
      this.toastService.success('Rota excluída com sucesso!');
      
      // Recarregar lista
      await this.ngOnInit();
      
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao excluir rota');
    } finally {
      this.loading.set(false);
      this.closeConfirmation();
    }
  }
  
  closeConfirmation() {
    this.showConfirmation.set(false);
    this.routeToDelete.set(null);
  }

  trackByRouteId(index: number, route: any): string {
    return route.id;
  }
}