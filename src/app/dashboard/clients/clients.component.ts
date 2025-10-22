import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faUsers, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-clients',
  imports: [FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  // Signals for state management
  clients = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // FontAwesome icons
  faPlus = faPlus;
  faUsers = faUsers;
  faEdit = faEdit;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.dataService.listClients();
      this.clients.set(data || []);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar clientes');
      console.error('Error loading clients:', err);
    } finally {
      this.loading.set(false);
    }
  }
}