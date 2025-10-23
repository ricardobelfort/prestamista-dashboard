import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { HomeComponent } from './home/home.component';
import { ClientsComponent } from './clients/clients.component';
import { LoansComponent } from './loans/loans.component';
import { PaymentsComponent } from './payments/payments.component';
import { RoutesComponent } from './routes/routes.component';
import { AdminComponent } from './admin/admin.component';
import { AdminGuard } from '../core/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'loans', component: LoansComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'routes', component: RoutesComponent },
      { 
        path: 'admin', 
        component: AdminComponent, 
        canActivate: [AdminGuard] 
      }
    ]
  }
];