import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faRoute, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-routes',
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './routes.component.html'
})
export class RoutesComponent implements OnInit {
  // Signals for state management
  routes = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // FontAwesome icons
  faPlus = faPlus;
  faRoute = faRoute;
  faEdit = faEdit;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.dataService.listRoutes();
      this.routes.set(data || []);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar rotas');
      console.error('Error loading routes:', err);
    } finally {
      this.loading.set(false);
    }
  }

  trackByRouteId(index: number, route: any): string {
    return route.id;
  }
}